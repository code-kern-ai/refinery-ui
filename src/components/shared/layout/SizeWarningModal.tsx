import { ModalEnum } from '@/src/types/shared/modal'
import Modal from '../modal/Modal'
import { useDispatch } from 'react-redux'
import { closeModal } from '@/src/reduxStore/states/modal'

export default function SizeWarningModal(props: { minWidth: number }) {
  const dispatch = useDispatch()

  return (
    <Modal modalName={ModalEnum.SIZE_WARNING} hasOwnButtons={true}>
      <div className="mb-2 flex flex-row justify-center text-lg font-medium leading-6 text-gray-900">
        Information{' '}
      </div>

      <div className="mt-3 flex flex-row justify-between">
        <div className="flex flex-row-reverse justify-start text-left text-sm">
          The application is designed for certain screen sizes (&gt;{' '}
          {props.minWidth}px width). If you continue, the application is
          provided with a global scrollbar.
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          className={`ml-2 cursor-pointer rounded-md border border-green-400 bg-green-100 px-4 py-2 text-xs font-semibold text-green-700 opacity-100 hover:bg-green-200 focus:outline-none`}
          onClick={() => dispatch(closeModal(ModalEnum.SIZE_WARNING))}
        >
          Continue
        </button>
      </div>
    </Modal>
  )
}
