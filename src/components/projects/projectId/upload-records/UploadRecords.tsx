import Upload from '@/src/components/shared/upload/Upload'
import { setUploadFileType } from '@/src/reduxStore/states/upload'
import { UploadFileType, UploadOptions } from '@/src/types/shared/upload'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

const BASE_OPTIONS = { deleteProjectOnFail: false }

export default function UploadRecords() {
  const dispatch = useDispatch()

  const [uploadOptions, setUploadOptions] =
    useState<UploadOptions>(BASE_OPTIONS)

  useEffect(() => {
    dispatch(setUploadFileType(UploadFileType.RECORDS_ADD))
    setUploadOptions({ ...BASE_OPTIONS })
  }, [])

  return (
    <div className="flex h-full overflow-hidden bg-gray-100">
      <div className="flex h-full w-full flex-1 flex-col overflow-auto">
        <Upload uploadOptions={uploadOptions}></Upload>
      </div>
    </div>
  )
}
