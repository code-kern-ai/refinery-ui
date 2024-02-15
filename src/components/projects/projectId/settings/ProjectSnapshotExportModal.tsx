import CryptedField from '@/src/components/shared/crypted-field/CryptedField'
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import Modal from '@/src/components/shared/modal/Modal'
import { closeModal, selectModal } from '@/src/reduxStore/states/modal'
import { selectEmbeddings } from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { downloadFile } from '@/src/services/base/s3-service'
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket'
import {
  GET_PROJECT_SIZE,
  LAST_PROJECT_EXPORT_CREDENTIALS,
  PREPARE_PROJECT_EXPORT,
} from '@/src/services/gql/queries/project-setting'
import {
  DownloadState,
  ProjectSize,
} from '@/src/types/components/projects/projectId/settings/project-export'
import { CurrentPage, CurrentPageSubKey } from '@/src/types/shared/general'
import { ModalEnum } from '@/src/types/shared/modal'
import { postProcessingFormGroups } from '@/src/util/components/projects/projectId/settings/project-export-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { downloadByteDataNoStringify } from '@/submodules/javascript-functions/export'
import { formatBytes } from '@/submodules/javascript-functions/general'
import { useLazyQuery } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { IconDownload, IconInfoCircle } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { timer } from 'rxjs'

export default function ProjectSnapshotExportModal() {
  const router = useRouter()
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const modal = useSelector(selectModal(ModalEnum.PROJECT_SNAPSHOT))
  const embeddings = useSelector(selectEmbeddings)

  const [projectSize, setProjectSize] = useState(null)
  const [projectExportArray, setProjectExportArray] =
    useState<ProjectSize[]>(null)
  const [downloadSizeText, setDownloadSizeText] = useState('')
  const [projectExportCredentials, setProjectExportCredentials] = useState(null)
  const [downloadPrepareMessage, setDownloadPrepareMessage] = useState(null)
  const [key, setKey] = useState('')

  const [refetchProjectSize] = useLazyQuery(GET_PROJECT_SIZE, {
    fetchPolicy: 'network-only',
  })
  const [refetchLastProjectExportCredentials] = useLazyQuery(
    LAST_PROJECT_EXPORT_CREDENTIALS,
    { fetchPolicy: 'no-cache' },
  )
  const [refetchProjectExport] = useLazyQuery(PREPARE_PROJECT_EXPORT, {
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (!modal || !modal.open) return
    if (!projectId) return
    requestProjectSize()
    requestProjectExportCredentials()
  }, [modal, projectId])

  useEffect(() => {
    if (!projectExportArray) return
    let downloadSize: number = 0
    for (let i = 0; i < projectExportArray.length; i++) {
      if (projectExportArray[i].export)
        downloadSize += projectExportArray[i].sizeNumber
    }
    setDownloadSizeText(downloadSize ? formatBytes(downloadSize, 2) : 'O bytes')
  }, [projectExportArray])

  function requestProjectSize() {
    refetchProjectSize({ variables: { projectId: projectId } }).then((res) => {
      setProjectSize(res.data['projectSize'])
      setProjectExportArray(
        postProcessingFormGroups(res.data['projectSize'], embeddings),
      )
    })
  }

  function requestProjectExportCredentials() {
    refetchLastProjectExportCredentials({
      variables: { projectId: projectId },
    }).then((res) => {
      const projectExportCredentials = res.data['lastProjectExportCredentials']
      if (!projectExportCredentials) setProjectExportCredentials(null)
      else {
        const credentials = JSON.parse(projectExportCredentials)
        const parts = credentials.objectName.split('/')
        credentials.downloadFileName = parts[parts.length - 1]
        setProjectExportCredentials(credentials)
      }
    })
  }

  function prepareDownload() {
    if (
      downloadPrepareMessage == DownloadState.PREPARATION ||
      downloadPrepareMessage == DownloadState.DOWNLOAD
    )
      return
    setDownloadPrepareMessage(DownloadState.PREPARATION)
    const exportOptions = buildJsonExportOptions()
    let keyToSend = key
    if (!keyToSend) keyToSend = null
    refetchProjectExport({
      variables: {
        projectId: projectId,
        exportOptions: exportOptions,
        key: keyToSend,
      },
    }).then((res) => {
      setProjectExportCredentials(null)
    })
  }

  function buildJsonExportOptions() {
    let toReturn = {}
    const values = projectExportArray
    for (const element of values) {
      if (element.export) toReturn[element.name] = true
    }
    return JSON.stringify(toReturn)
  }

  function exportViaFile() {
    if (!projectExportCredentials) return
    setDownloadPrepareMessage(DownloadState.DOWNLOAD)
    const fileName = projectExportCredentials.downloadFileName
    downloadFile(projectExportCredentials, false).subscribe((data) => {
      downloadByteDataNoStringify(data, fileName)
      timer(5000).subscribe(() => setDownloadPrepareMessage(DownloadState.NONE))
    })
  }

  const handleWebsocketNotification = useCallback((msgParts: string[]) => {
    if (msgParts[1] == 'project_export') {
      setDownloadPrepareMessage(DownloadState.NONE)
      requestProjectExportCredentials()
    }
  }, [])

  useWebsocket(
    CurrentPage.PROJECT_SETTINGS,
    handleWebsocketNotification,
    projectId,
    CurrentPageSubKey.SNAPSHOT_EXPORT,
  )

  return (
    <Modal modalName={ModalEnum.PROJECT_SNAPSHOT} hasOwnButtons={true}>
      <div className="text-center text-lg font-medium leading-6 text-gray-900">
        Project export{' '}
      </div>
      <div className="mt-1 text-sm font-medium leading-5 text-gray-700">
        See the size of each export item.
      </div>
      <div className="flex flex-col">
        {projectSize ? (
          <div>
            <form>
              <div
                className="grid items-center gap-x-4 p-2"
                style={{ gridTemplateColumns: 'auto 25px auto auto' }}
              >
                <div className="flex">
                  <span className="card-title label-text mb-0">Name</span>
                </div>
                <div></div>
                <div className="flex">
                  <span className="card-title label-text mb-0">
                    Size estimate
                  </span>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                  <span className="card-title label-text mb-0">Export</span>
                </div>
                {projectExportArray.map((item: ProjectSize, index: number) => (
                  <Fragment key={item.name}>
                    <div className="contents">
                      <div className="flex">
                        <p
                          className={`capitalize-first cursor-default break-words ${item.moveRight ? 'ml-4' : null}`}
                        >
                          {item.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-items-center">
                      {item.desc && (
                        <Tooltip
                          content={item.desc}
                          color="invert"
                          placement="top"
                          className="cursor-auto"
                        >
                          <IconInfoCircle className="h-6 w-6 text-gray-900" />
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex">{item.sizeReadable}</div>
                    <div className="flex justify-center">
                      <div className="form-control">
                        <label className="card-title label mb-0 cursor-pointer p-0">
                          <input
                            type="checkbox"
                            className="cursor-pointer"
                            checked={item.export}
                            onChange={(e: any) => {
                              const tmpArray = [...projectExportArray]
                              tmpArray[index].export = e.target.checked
                              setProjectExportArray(tmpArray)
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-8 mt-4 flex flex-col items-center justify-items-center">
            <LoadingIcon />
          </div>
        )}
      </div>
      {projectSize && (
        <div className="mt-4" style={{ borderTop: '1px solid #ddd' }}>
          <div></div>
          <div className="my-2 mr-2 flex flex-row flex-nowrap justify-end">
            <span className="card-title label-text mb-0">
              Final size estimate:
            </span>
            <span className="card-title label-text mb-0 ml-2">
              {downloadSizeText}
            </span>
          </div>
          <CryptedField
            label="Encrypt zip file with password"
            keyChange={(key: string) => setKey(key)}
          />
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {projectExportCredentials &&
          projectExportCredentials.downloadFileName && (
            <Tooltip
              content={TOOLTIPS_DICT.PROJECT_SETTINGS.LATEST_SNAPSHOT}
              color="invert"
            >
              <button
                onClick={exportViaFile}
                className="mr-4 cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <IconDownload className="mr-1 inline-block h-5 w-5" />
                {projectExportCredentials.downloadFileName}
              </button>
            </Tooltip>
          )}
        <button
          onClick={prepareDownload}
          disabled={
            downloadPrepareMessage == DownloadState.PREPARATION ||
            downloadPrepareMessage == DownloadState.DOWNLOAD
          }
          className={`mr-4 flex cursor-pointer items-center rounded-md border border-green-400 bg-green-100 px-4 text-xs font-semibold text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
          type="submit"
        >
          Prepare download
          {downloadPrepareMessage == DownloadState.PREPARATION && (
            <span className="ml-2">
              <LoadingIcon color="green" />
            </span>
          )}
        </button>
        <button
          onClick={() => dispatch(closeModal(ModalEnum.PROJECT_SNAPSHOT))}
          className="cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
