import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import Modal from '../modal/Modal'
import {
  UploadFileType,
  UploadOptions,
  UploadProps,
} from '@/src/types/shared/upload'
import { getSubtitle, getTitle } from '@/src/util/shared/modal-upload-helper'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectAllProjects } from '@/src/reduxStore/states/project'
import Upload from './Upload'
import { selectUploadData } from '@/src/reduxStore/states/upload'
import { IconAlertTriangle } from '@tabler/icons-react'
import { timer } from 'rxjs'

const ACCEPT_BUTTON = {
  buttonCaption: 'Upload',
  closeAfterClick: false,
  useButton: true,
  disabled: true,
}

export default function ModalUpload(props: UploadProps) {
  const projects = useSelector(selectAllProjects)
  const uploadFileType = useSelector(selectUploadData).uploadFileType

  const [projectName, setProjectName] = useState<string>('')
  const [isProjectTitleDuplicate, setProjectTitleDuplicate] =
    useState<boolean>(false)
  const [startUpload, setStartUpload] = useState<boolean>(false)

  const submitUpload = useCallback(() => {
    if (isProjectTitleDuplicate) return
    setStartUpload(true)
    timer(3000).subscribe(() => {
      setProjectName('')
      setStartUpload(false)
    })
  }, [])

  const [acceptButton, setAcceptButton] = useState<ModalButton>({
    ...ACCEPT_BUTTON,
    emitFunction: submitUpload,
  })
  const [uploadOptions, setUploadOptions] = useState<UploadOptions>(null)

  const title = getTitle(uploadFileType)
  const subTitle = getSubtitle(uploadFileType)

  useEffect(() => {
    if (!props.uploadOptions) return
    setUploadOptions({
      deleteProjectOnFail: props.uploadOptions.deleteProjectOnFail,
      reloadOnFinish: props.uploadOptions.reloadOnFinish,
      knowledgeBaseId:
        uploadFileType == UploadFileType.KNOWLEDGE_BASE
          ? props.uploadOptions.knowledgeBaseId
          : null,
      isModal: props.uploadOptions.isModal,
      tokenizer: props.uploadOptions.tokenizer,
      showBadPasswordMsg: props.uploadOptions.showBadPasswordMsg,
      projectName: projectName,
    })
  }, [projectName, props.uploadOptions, uploadFileType])

  function checkIfProjectNameDuplicate(value: string) {
    setProjectTitleDuplicate(projects.some((project) => project.name == value))
  }

  return (
    <Modal modalName={ModalEnum.MODAL_UPLOAD} acceptButton={acceptButton}>
      <h1 className="flex flex-grow justify-center text-lg font-bold text-gray-900">
        {title}
      </h1>
      <div className="mb-4 text-center text-sm text-gray-500">{subTitle}</div>
      {uploadFileType == UploadFileType.PROJECT && (
        <div className="form-control text-left">
          <label className="text-sm font-normal text-gray-500">
            Project title<em> - optional</em>
          </label>
          <input
            value={projectName}
            type="text"
            onInput={(e: any) => {
              setProjectName(e.target.value)
              checkIfProjectNameDuplicate(e.target.value)
            }}
            onKeyDown={(e: any) => {
              if (e.key == 'Enter') submitUpload()
            }}
            className="placeholder-italic h-8 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            placeholder="Enter some title here..."
          />
          {isProjectTitleDuplicate && (
            <div className="mt-2 text-xs text-red-700">
              Project title exists
            </div>
          )}
          <div className="mt-2 flex flex-row">
            <IconAlertTriangle className="h-5 w-5 text-yellow-700" />
            <label className="ml-2 text-xs italic text-yellow-700">
              If no project title is specified, the title mentioned in the
              uploaded data will be used, potentially leading to a duplication
              of project titles.
            </label>
          </div>
        </div>
      )}
      <Upload
        uploadOptions={uploadOptions}
        startUpload={startUpload}
        isFileUploaded={(isFileUploaded: boolean) => {
          setAcceptButton({
            ...acceptButton,
            disabled: isFileUploaded ? false : true,
          })
        }}
        closeModalEvent={props.closeModalEvent}
      />
    </Modal>
  )
}
