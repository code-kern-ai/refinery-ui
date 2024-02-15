import Modal from '@/src/components/shared/modal/Modal'
import { closeModal } from '@/src/reduxStore/states/modal'
import { ExplainModalProps } from '@/src/types/components/projects/projectId/edit-records'
import { ModalEnum } from '@/src/types/shared/modal'
import {
  IconAlertTriangleFilled,
  IconInfoCircleFilled,
} from '@tabler/icons-react'
import { useDispatch } from 'react-redux'

export default function ExplainModal(props: ExplainModalProps) {
  const dispatch = useDispatch()

  function closeModalAndNeverShowAgain() {
    localStorage.setItem('ERhideExplainModal', 'X')
    const erdDataCopy = { ...props.erdData }
    erdDataCopy.modals.hideExplainModal = true
    props.setErdData(erdDataCopy)
    dispatch(closeModal(ModalEnum.EXPLAIN_EDIT_RECORDS))
  }

  return (
    <Modal modalName={ModalEnum.EXPLAIN_EDIT_RECORDS} hasOwnButtons={true}>
      <h1 className="mb-2 text-center text-lg text-gray-900">
        Warning
        <IconAlertTriangleFilled className="inline-block text-yellow-400" />
      </h1>
      <div className="my-2 flex flex-col gap-y-2 text-sm font-medium text-gray-700">
        <div>Changing records directly should only be done in edge cases! </div>
        <div>This changes your data and cannot be undone.</div>
      </div>
      <h1 className="inline-flex items-center gap-x-1 text-center text-lg text-gray-900">
        Info
        <IconInfoCircleFilled className="inline-block text-blue-400" />
      </h1>
      <div className="my-2 flex flex-col gap-y-2 text-sm font-medium text-gray-700">
        <div>
          Currently your changes are only <b>cached</b>. This means they
          aren&apos;t persisted/updated yet.
        </div>
        <div>
          To persist the changes you need to <b>Synchronize with DB</b>.{' '}
        </div>
        <div>
          Note that this will rerun tokenization & embedding calculation for
          changed records.
        </div>
        <div>
          Further, already set labels for information extraction will be
          removed.
        </div>
        <div>
          Attribute calculation, Weak Supervision and Heuristics are <b>NOT</b>{' '}
          rerun automatically.
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={closeModalAndNeverShowAgain}
          className="ml-2 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close and never show again
        </button>
        <button
          onClick={() => dispatch(closeModal(ModalEnum.EXPLAIN_EDIT_RECORDS))}
          className="ml-2 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
