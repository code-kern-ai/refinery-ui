import {
  UploadFileType,
  UploadProps,
  UploadState,
  UploadStates,
  UploadTask,
  UploadType,
} from '@/src/types/shared/upload'
import { useDispatch, useSelector } from 'react-redux'
import UploadField from './helper-components/UploadField'
import { useEffect, useState } from 'react'
import UploadWrapper from './helper-components/UploadWrapper'
import {
  selectUploadData,
  setImportOptions,
} from '@/src/reduxStore/states/upload'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  UPDATE_PROJECT_STATUS,
  UPDATE_PROJECT_TOKENIZER,
} from '@/src/services/gql/mutations/projects'
import { ProjectStatus } from '@/src/types/components/projects/projects-list'
import { timer } from 'rxjs'
import { uploadFile } from '@/src/services/base/s3-service'
import { CurrentPage } from '@/src/types/shared/general'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import { useRouter } from 'next/router'
import {
  extendAllProjects,
  removeFromAllProjectsById,
  selectAllProjects,
  selectProjectId,
} from '@/src/reduxStore/states/project'
import {
  GET_UPLOAD_CREDENTIALS_AND_ID,
  GET_UPLOAD_TASK_BY_TASK_ID,
} from '@/src/services/gql/queries/projects'
import { UPLOAD_TOKENIZERS } from '@/src/util/constants'
import { UploadHelper, ZIP_TYPE } from '@/src/util/classes/upload-helper'
import CryptedField from '../crypted-field/CryptedField'
import { closeModal } from '@/src/reduxStore/states/modal'
import { ModalEnum } from '@/src/types/shared/modal'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket'

export default function Upload(props: UploadProps) {
  const router = useRouter()
  const dispatch = useDispatch()

  const uploadFileType = useSelector(selectUploadData).uploadFileType
  const importOptions = useSelector(selectUploadData).importOptions
  const projects = useSelector(selectAllProjects)
  const projectId = useSelector(selectProjectId)

  const [selectedFile, setSelectedFile] = useState(null as File)
  const [projectTitle, setProjectTitle] = useState<string>('')
  const [projectDescription, setProjectDescription] = useState<string>('')
  const [tokenizer, setTokenizer] = useState<string>(
    UPLOAD_TOKENIZERS.ENGLISH.FULL_NAME,
  )
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [uploadStarted, setUploadStarted] = useState<boolean>(false)
  const [doingSomething, setDoingSomething] = useState<boolean>(false)
  const [progressState, setProgressState] = useState<UploadState>(null)
  const [isProjectTitleDuplicate, setIsProjectTitleDuplicate] =
    useState<boolean>(false)
  const [isProjectTitleEmpty, setIsProjectTitleEmpty] = useState<boolean>(false)
  const [prepareTokenizedValues, setPrepareTokenizedValues] = useState<any[]>(
    [],
  )
  const [key, setKey] = useState('')
  const [fileEndsWithZip, setFileEndsWithZip] = useState<boolean>(false)

  const [createProjectMut] = useMutation(CREATE_PROJECT)
  const [deleteProjectMut] = useMutation(DELETE_PROJECT)
  const [updateProjectTokenizerMut] = useMutation(UPDATE_PROJECT_TOKENIZER)
  const [updateProjectStatusMut] = useMutation(UPDATE_PROJECT_STATUS)
  const [uploadCredentialsMut] = useLazyQuery(GET_UPLOAD_CREDENTIALS_AND_ID, {
    fetchPolicy: 'network-only',
  })
  const [getUploadTaskId] = useLazyQuery(GET_UPLOAD_TASK_BY_TASK_ID, {
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (!props.uploadOptions.tokenizerValues) return
    const tokenizerValuesDisplay = [...props.uploadOptions.tokenizerValues]
    tokenizerValuesDisplay.forEach((tokenizer: any, index: number) => {
      const tokenizerNameContainsBrackets =
        tokenizer.name.includes('(') && tokenizer.name.includes(')')
      const tokenizerCopy = { ...tokenizer }
      tokenizerCopy.name =
        tokenizer.name +
        (tokenizer.configString != undefined && !tokenizerNameContainsBrackets
          ? ` (${tokenizer.configString})`
          : '')
      tokenizerValuesDisplay[index] = tokenizerCopy
    })
    setPrepareTokenizedValues(tokenizerValuesDisplay)
  }, [props.uploadOptions.tokenizerValues])

  useEffect(() => {
    if (props.startUpload) {
      submitUpload()
    }
  }, [props.startUpload])

  useEffect(() => {
    if (props.isFileUploaded) props.isFileUploaded(selectedFile != null)
  }, [selectedFile])

  function handleWebsocketNotification(msgParts: string[]) {
    const uploadTask = UploadHelper.getUploadTask()
    const projectId = UploadHelper.getProjectId()
    if (!uploadTask) return
    if (msgParts[2] != uploadTask.id) return
    if (msgParts[3] == 'state') {
      if (msgParts[4] == UploadStates.DONE) {
        getUploadTaskId({
          variables: { projectId: projectId, uploadTaskId: uploadTask.id },
        }).then((res) => {
          const task = res.data['uploadTaskById']
          handleUploadTaskResult(task)
        })
      } else if (msgParts[4] == UploadStates.ERROR) {
        resetUpload()
        if (props.uploadOptions.deleteProjectOnFail) {
          deleteExistingProject()
          setSubmitted(false)
          setDoingSomething(false)
        }
      } else {
        const uploadTaskSave = { ...uploadTask }
        uploadTaskSave.state = msgParts[4]
        UploadHelper.setUploadTask(uploadTaskSave)
      }
    } else if (msgParts[3] == 'progress') {
      if (msgParts[4] == '100') {
        getUploadTaskId({
          variables: { projectId: projectId, uploadTaskId: uploadTask.id },
        }).then((res) => {
          const task = res.data['uploadTaskById']
          handleUploadTaskResult(task)
        })
      } else {
        const uploadTaskSave = jsonCopy(uploadTask)
        uploadTaskSave.progress = msgParts[4]
        UploadHelper.setUploadTask(uploadTaskSave)
      }
    } else {
      console.log(
        'unknown websocket message in part 3:' + msgParts[3],
        'full message:',
        msgParts,
      )
    }
  }

  function submitUpload() {
    setSubmitted(true)
    if (!selectedFile) return
    if (uploadFileType == UploadFileType.RECORDS_NEW) {
      if (projectTitle.trim() == '') {
        setIsProjectTitleEmpty(true)
        return
      }
      createProjectMut({
        variables: { name: projectTitle, description: projectDescription },
      }).then((res) => {
        const project = res.data.createProject['project']
        dispatch(extendAllProjects(project))
        UploadHelper.setProjectId(project.id)
        executeUploadFile()
      })
    } else if (uploadFileType == UploadFileType.PROJECT) {
      createProjectMut({
        variables: {
          name: props.uploadOptions.projectName,
          description: 'Created during file upload ' + selectedFile?.name,
        },
      }).then((res) => {
        const project = res.data.createProject['project']
        dispatch(extendAllProjects(project))
        UploadHelper.setProjectId(project.id)
        executeUploadFile()
      })
    } else if (uploadFileType == UploadFileType.RECORDS_ADD) {
      UploadHelper.setProjectId(projectId)
      executeUploadFile()
    } else if (uploadFileType == UploadFileType.KNOWLEDGE_BASE) {
      UploadHelper.setProjectId(projectId)
      executeUploadFile()
    }
  }

  function executeUploadFile() {
    updateTokenizerAndProjectStatus()
    const finalFinalName = getFileNameBasedOnType()
    const importOptionsPrep =
      uploadFileType == UploadFileType.RECORDS_NEW ? importOptions : ''
    finishUpUpload(finalFinalName, importOptionsPrep)
  }

  function updateTokenizerAndProjectStatus() {
    let tokenizerPrep = ''
    if (
      uploadFileType == UploadFileType.RECORDS_NEW ||
      uploadFileType == UploadFileType.RECORDS_ADD
    ) {
      tokenizerPrep = tokenizer.split('(')[1].split(')')[0]
    } else {
      tokenizerPrep = '(' + UPLOAD_TOKENIZERS.ENGLISH.TOKENIZER + ')'
    }
    updateProjectTokenizerMut({
      variables: {
        projectId: UploadHelper.getProjectId(),
        tokenizer: tokenizerPrep,
      },
    }).then((res) => {
      updateProjectStatusMut({
        variables: {
          projectId: UploadHelper.getProjectId(),
          newStatus: ProjectStatus.INIT_COMPLETE,
        },
      })
    })
  }

  function getFileNameBasedOnType() {
    const fileName = selectedFile?.name
    switch (uploadFileType) {
      case UploadFileType.RECORDS_ADD:
      case UploadFileType.RECORDS_NEW:
        return fileName + '_SCALE'
      case UploadFileType.KNOWLEDGE_BASE:
        return fileName + '_' + props.uploadOptions.knowledgeBaseId
      default:
        return fileName
    }
  }

  function finishUpUpload(finalFinalName: string, importOptionsPrep: string) {
    let keyToSend = key
    if (!keyToSend) keyToSend = null
    uploadCredentialsMut({
      variables: {
        projectId: UploadHelper.getProjectId(),
        fileName: finalFinalName,
        fileType: uploadFileType,
        fileImportOptions: importOptionsPrep,
        uploadType: UploadType.DEFAULT,
        key: keyToSend,
      },
    }).then((results) => {
      const credentialsAndUploadId = JSON.parse(
        JSON.parse(results.data['uploadCredentialsAndId']),
      )
      uploadFileToMinio(credentialsAndUploadId, finalFinalName)
    })
  }

  function uploadFileToMinio(credentialsAndUploadId: any, fileName: string) {
    setUploadStarted(true)
    setDoingSomething(true)
    getUploadTaskId({
      variables: {
        projectId: UploadHelper.getProjectId(),
        uploadTaskId: credentialsAndUploadId.uploadTaskId,
      },
    }).then((res) => {
      const task = res.data['uploadTaskById']
      handleUploadTaskResult(task)
      uploadFile(credentialsAndUploadId, selectedFile, fileName).subscribe(
        (progress) => {
          setProgressState(progress)
          if (
            progress.state === UploadStates.DONE ||
            progress.state === UploadStates.ERROR
          ) {
            timer(500).subscribe(() => {
              setSelectedFile(null)
              setSubmitted(false)
              if (props.uploadOptions.isModal) {
                dispatch(closeModal(ModalEnum.MODAL_UPLOAD))
                if (props.closeModalEvent) props.closeModalEvent()
              }
            })
            if (
              progress.state === UploadStates.ERROR &&
              props.uploadOptions.deleteProjectOnFail
            ) {
              deleteExistingProject()
              setSubmitted(false)
            }
          }
        },
      )
    })
  }

  function handleUploadTaskResult(task: UploadTask) {
    UploadHelper.setUploadTask(task)
    if (task.state == UploadStates.DONE || task.progress == 100) {
      clearUploadTask()
      if (props.uploadOptions.reloadOnFinish) location.reload()
      else setUploadStarted(false)
      router.push('/projects/' + UploadHelper.getProjectId() + '/settings')
    }
  }

  function clearUploadTask() {
    UploadHelper.setUploadTask(null)
    setProgressState(null)
    setDoingSomething(false)
  }

  function resetUpload() {
    setSelectedFile(null)
    clearUploadTask()
    setUploadStarted(false)
    setProjectTitle('')
    setProjectDescription('')
    setTokenizer(UPLOAD_TOKENIZERS.ENGLISH.FULL_NAME)
    dispatch(setImportOptions(''))
  }

  function deleteExistingProject() {
    const projectId = UploadHelper.getProjectId()
    deleteProjectMut({ variables: { projectId: projectId } }).then((res) => {
      dispatch(removeFromAllProjectsById(projectId))
    })
  }

  function checkIfProjectTitleExists(projectTitle: string) {
    const findProjectName = projects.find(
      (project) => project.name == projectTitle,
    )
    if (findProjectName) setIsProjectTitleDuplicate(true)
    else setIsProjectTitleDuplicate(false)
  }

  useWebsocket(
    CurrentPage.UPLOAD_RECORDS,
    handleWebsocketNotification,
    UploadHelper.getProjectId(),
  )

  return (
    <section className={`${!props.uploadOptions.isModal ? 'p-4' : ''}`}>
      {uploadFileType == UploadFileType.PROJECT && (
        <>
          <UploadField
            isFileCleared={selectedFile == null}
            uploadStarted={uploadStarted}
            doingSomething={doingSomething}
            progressState={progressState}
            sendSelectedFile={(file) => {
              setSelectedFile(file)
              setFileEndsWithZip(file.name.endsWith('.zip'))
            }}
          />
          {selectedFile &&
            (selectedFile.type == ZIP_TYPE || fileEndsWithZip) && (
              <CryptedField
                placeholder="Enter password if zip file is protected..."
                keyChange={(key) => setKey(key)}
              />
            )}
          {props.uploadOptions.showBadPasswordMsg && (
            <div className="mt-2 text-center text-xs text-red-700">
              Wrong password
            </div>
          )}
        </>
      )}
      {uploadFileType == UploadFileType.RECORDS_NEW && (
        <>
          <div className="form-control">
            <label className="text-sm font-normal text-gray-500">
              Project title
            </label>
            <div className="flex flex-row">
              <input
                type="text"
                value={projectTitle}
                onInput={(e: any) => {
                  if (e.target.value == '') setIsProjectTitleEmpty(true)
                  else setIsProjectTitleEmpty(false)
                  checkIfProjectTitleExists(e.target.value)
                  setProjectTitle(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key == 'Enter') submitUpload()
                }}
                className="placeholder-italic h-9 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                placeholder="Enter some title here..."
              />
            </div>
          </div>
          {isProjectTitleDuplicate && (
            <div className="mt-2 text-xs text-red-700">
              Project title exists
            </div>
          )}
          {isProjectTitleEmpty && (
            <div className="mt-2 text-xs text-red-700">
              Project title is required
            </div>
          )}
          <div className="form-control mt-6">
            <label className="text-sm font-normal text-gray-500">
              Project description <em>- optional</em>
            </label>
            <textarea
              value={projectDescription}
              onInput={(e: any) => setProjectDescription(e.target.value)}
              className="placeholder-italic h-9 w-full rounded-md border border-gray-300 pl-4 leading-8 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
              placeholder="Enter some description here..."
            ></textarea>
          </div>
          <div className="form-control mt-6">
            <label className="text-sm font-normal text-gray-500">
              Please choose a tokenizer for your project. See our{' '}
              <a
                href="https://docs.kern.ai/refinery/project-creation-and-data-upload"
                target="_blank"
              >
                <span className="cursor-pointer underline">documentation</span>
              </a>{' '}
              for further details.
            </label>
            <Dropdown2
              buttonName={tokenizer}
              options={prepareTokenizedValues}
              disabledOptions={prepareTokenizedValues.map(
                (tokenizer: any) => tokenizer.disabled,
              )}
              selectedOption={(option) => setTokenizer(option.name)}
              dropdownItemsClasses="max-h-80 overflow-y-auto"
            />
          </div>
          <UploadWrapper
            uploadStarted={uploadStarted}
            doingSomething={doingSomething}
            progressState={progressState}
            submitted={submitted}
            isFileCleared={selectedFile == null}
            isModal={props.uploadOptions.isModal}
            submitUpload={submitUpload}
            sendSelectedFile={(file) => {
              setSelectedFile(file)
            }}
            setKey={(key) => setKey(key)}
          />
        </>
      )}

      {uploadFileType == UploadFileType.RECORDS_ADD && (
        <>
          <div className="inline-block text-lg font-medium leading-6 text-gray-900">
            Record upload
          </div>
          <div className="mt-2 text-sm font-normal text-gray-500">
            Add additional records to your project
          </div>
          <UploadWrapper
            uploadStarted={uploadStarted}
            doingSomething={doingSomething}
            progressState={progressState}
            submitted={submitted}
            isFileCleared={selectedFile == null}
            isModal={props.uploadOptions.isModal}
            submitUpload={submitUpload}
            sendSelectedFile={(file) => {
              setSelectedFile(file)
            }}
            setKey={(key) => setKey(key)}
          />
        </>
      )}

      {uploadFileType == UploadFileType.KNOWLEDGE_BASE && (
        <UploadWrapper
          uploadStarted={uploadStarted}
          doingSomething={doingSomething}
          progressState={progressState}
          submitted={submitted}
          isFileCleared={selectedFile == null}
          isModal={props.uploadOptions.isModal}
          submitUpload={submitUpload}
          sendSelectedFile={(file) => {
            setSelectedFile(file)
          }}
          setKey={(key) => setKey(key)}
        />
      )}
    </section>
  )
}
