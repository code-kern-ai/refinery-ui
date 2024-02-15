import { openModal } from '@/src/reduxStore/states/modal'
import { ModalEnum } from '@/src/types/shared/modal'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import { IconDownload } from '@tabler/icons-react'
import { useDispatch } from 'react-redux'
import ExportRecordsModal from './ExportRecordsModal'
import { ExportProps } from '@/src/types/shared/export'

export default function Export(props: ExportProps) {
  const dispatch = useDispatch()
  return (
    <>
      <Tooltip
        content={TOOLTIPS_DICT.GENERAL.DOWNLOAD_RECORDS}
        color="invert"
        placement="bottom"
      >
        <button
          onClick={() => dispatch(openModal(ModalEnum.EXPORT_RECORDS))}
          className="mr-1 inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          <IconDownload className="mr-1 inline-block h-5 w-5" />
          Download records
        </button>
      </Tooltip>
      <ExportRecordsModal sessionId={props.sessionId} />
    </>
  )
}
