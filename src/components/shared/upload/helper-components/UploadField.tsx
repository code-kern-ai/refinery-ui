import { UploadFieldProps, UploadStates } from '@/src/types/shared/upload'
import { formatBytes } from '@/submodules/javascript-functions/general'
import { useEffect, useRef, useState } from 'react'
import LoadingIcon from '../../loading/LoadingIcon'
import { IconDatabase } from '@tabler/icons-react'
import { UploadHelper } from '@/src/util/classes/upload-helper'
import { useDropzone } from 'react-dropzone'

export default function UploadField(props: UploadFieldProps) {
  const fileUpload = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState(null)
  const [fileSize, setFileSize] = useState(null)

  function onDrop(acceptedFiles) {
    if (acceptedFiles && acceptedFiles[0]) {
      setFileSize(formatBytes(acceptedFiles[0].size))
      setFile(acceptedFiles[0])
      props.sendSelectedFile(acceptedFiles[0])
    } else {
      setFile(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  useEffect(() => {
    if (props.isFileCleared) {
      setFile(null)
    }
  }, [props.isFileCleared])

  function onFileInput(e: Event) {
    e.stopPropagation()
    if (fileUpload.current?.files && fileUpload.current?.files[0]) {
      setFileSize(formatBytes(fileUpload.current?.files[0].size))
      setFile(fileUpload.current?.files[0])
      props.sendSelectedFile(fileUpload.current?.files[0])
    } else {
      setFile(null)
    }
    fileUpload.current!.value = ''
  }

  function onFileRemove(event: Event): void {
    event.stopPropagation()
    setFile(null)
    fileUpload.current!.value = ''
  }

  return (
    <div>
      <input
        type="file"
        className="hidden"
        ref={fileUpload}
        onChange={(e: any) => onFileInput(e)}
      />
      <input {...getInputProps()} />
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex flex-grow items-center overflow-x-hidden">
            <div
              {...getRootProps()}
              onClick={() => fileUpload.current?.click()}
              className={`my-6 h-36 w-full cursor-pointer rounded-lg border-4 border-dashed ${file || props.uploadStarted ? 'bg-white' : 'border-slate-400'}`}
              style={{ pointerEvents: props.uploadStarted ? 'none' : 'auto' }}
            >
              <IconDatabase className="m-auto mt-6 block h-9 w-8 text-gray-500" />
              {file == null && !props.uploadStarted ? (
                <div className="mb-6 text-center text-sm font-medium text-gray-600">
                  <button className="mt-1 text-indigo-700">
                    Click to select a file
                  </button>
                  <div className="mt-1 text-xs font-normal text-gray-500">
                    or drag and drop
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center text-sm font-medium text-indigo-700">
                    {file?.name}{' '}
                    <span
                      className={`uppercase text-gray-600 ${props.doingSomething ? 'hidden' : 'inline-block'}`}
                    >
                      {fileSize}
                    </span>
                  </div>
                  <button
                    onClick={(e: any) => onFileRemove(e)}
                    className={`m-auto block cursor-pointer rounded-md border border-red-400 bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${props.uploadStarted || props.doingSomething ? 'hidden' : 'block'}`}
                  >
                    Remove
                  </button>
                </>
              )}

              {props.uploadStarted &&
                props.isFileCleared &&
                (UploadHelper.getUploadTask()?.state ==
                  UploadStates.IN_PROGRESS ||
                  UploadHelper.getUploadTask()?.state == UploadStates.WAITING ||
                  UploadHelper.getUploadTask()?.state ==
                    UploadStates.PENDING) && (
                  <div>
                    <div className="mx-2 -mt-1 mb-2 flex flex-row flex-nowrap items-center">
                      <span className="whitespace-nowrap">
                        Preparing data...
                      </span>
                      <LoadingIcon color="blue" />

                      <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2.5 rounded-full bg-blue-700"
                          style={{
                            width: UploadHelper.getUploadTask().progress + '%',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

              {!props.isFileCleared && props.progressState && (
                <div className="m-2">
                  {!(props.progressState.state === UploadStates.ERROR) && (
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-green-400"
                        style={{ width: props.progressState.progress + '%' }}
                      ></div>
                    </div>
                  )}
                  {props.progressState.state === UploadStates.ERROR && (
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-red-700"
                        style={{ width: props.progressState.progress + '%' }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
