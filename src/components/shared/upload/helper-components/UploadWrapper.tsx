import {
  UploadFileType,
  UploadStates,
  UploadWrapperProps,
} from '@/src/types/shared/upload'
import UploadField from './UploadField'
import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectUploadData,
  setImportOptions,
} from '@/src/reduxStore/states/upload'
import { useRouter } from 'next/router'
import { IconAlertTriangle } from '@tabler/icons-react'
import { selectEmbeddings } from '@/src/reduxStore/states/pages/settings'
import {
  Embedding,
  PlatformType,
} from '@/src/types/components/projects/projectId/settings/embeddings'
import CryptedField from '../../crypted-field/CryptedField'
import { ZIP_TYPE } from '@/src/util/classes/upload-helper'

export default function UploadWrapper(props: UploadWrapperProps) {
  const router = useRouter()
  const dispatch = useDispatch()

  const uploadFileType = useSelector(selectUploadData).uploadFileType
  const importOptions = useSelector(selectUploadData).importOptions
  const embeddings = useSelector(selectEmbeddings)
  const recalculationCosts = embeddings.some(
    (e: Embedding) =>
      e.platform == PlatformType.COHERE ||
      e.platform == PlatformType.OPEN_AI ||
      e.platform == PlatformType.AZURE,
  )

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileEndsWithZip, setFileEndsWithZip] = useState<boolean>(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <>
      <UploadField
        isFileCleared={props.isFileCleared}
        uploadStarted={props.uploadStarted}
        doingSomething={props.doingSomething}
        progressState={props.progressState}
        sendSelectedFile={(file) => {
          setSelectedFile(file)
          setFileEndsWithZip(file.name.endsWith('.zip'))
          props.sendSelectedFile(file)
        }}
      />
      {props.submitted &&
        !selectedFile &&
        props.uploadTask?.state !== UploadStates.IN_PROGRESS && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <IconAlertTriangle className="h-5 w-5 text-yellow-800" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  File required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    If you are choosing to start a project by uploading a file,
                    you must specify one first. Please upload one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {selectedFile && (selectedFile.type == ZIP_TYPE || fileEndsWithZip) && (
        <CryptedField
          placeholder="Enter password if zip file is protected..."
          keyChange={(key) => props.setKey(key)}
        />
      )}

      {uploadFileType != UploadFileType.KNOWLEDGE_BASE && (
        <div className="form-group">
          <label className="text-sm font-normal text-gray-500">
            You can specify import file upload options for your file. See how
            this is done for{' '}
            <a
              href="https://pandas.pydata.org/docs/reference/api/pandas.read_json.html"
              target="_blank"
            >
              <span className="cursor-pointer underline">JSON</span>
            </a>
            ,{' '}
            <a
              href="https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html"
              target="_blank"
            >
              <span className="cursor-pointer underline">CSV</span>
            </a>{' '}
            and{' '}
            <a
              href="https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html"
              target="_blank"
            >
              <span className="cursor-pointer underline">spreadsheets</span>
            </a>
            . If you leave it blank, we&apos;ll use default settings
          </label>
          <div>
            <textarea
              value={importOptions}
              ref={textareaRef}
              className="placeholder-indigo mt-1 w-full rounded-md p-4 text-sm shadow"
              rows={3}
              placeholder={`E.g. for uncommon CSV ${'\n'} sep=${'\\'}t ${'\n'} lineterminator=${'\\'}r`}
              onChange={() =>
                dispatch(setImportOptions(textareaRef.current?.value))
              }
            ></textarea>
          </div>
        </div>
      )}

      {uploadFileType == UploadFileType.RECORDS_ADD && (
        <div className="text-sm font-normal text-gray-500">
          <strong className="text-sm font-medium text-gray-700">
            CAUTION:
          </strong>
          {
            ' Submitting new records will automatically run attribute calculation and embeddings'
          }
          {recalculationCosts && (
            <span>
              (recreation of the embeddings will calculate them one more time
              and could cause additional fees)
            </span>
          )}
          {' for all records.'}
        </div>
      )}

      {!props.isModal && (
        <div className="mt-4 flex flex-row gap-x-2">
          <button
            onClick={props.submitUpload}
            type="submit"
            className="cursor-pointer rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white opacity-100 hover:bg-blue-800 focus:outline-none"
          >
            Proceed
          </button>
          <button
            type="button"
            onClick={() =>
              uploadFileType == UploadFileType.RECORDS_NEW
                ? router.push('/projects')
                : router.back()
            }
            className="cursor-pointer rounded-md border border-red-400 bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 focus:outline-none"
          >
            {uploadFileType == UploadFileType.RECORDS_NEW
              ? 'Cancel project creation'
              : 'Cancel'}
          </button>
        </div>
      )}
    </>
  )
}
