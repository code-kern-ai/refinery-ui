import { DangerZoneProps } from '@/src/types/shared/danger-zone'
import { Tooltip } from '@nextui-org/react'
import { ModalEnum } from '@/src/types/shared/modal'
import { setModalStates } from '@/src/reduxStore/states/modal'
import { useDispatch } from 'react-redux'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import DeleteElementModal from './DeleteElementModal'

export default function DangerZone(props: DangerZoneProps) {
  const dispatch = useDispatch()

  return (
    <div className="mt-8 pb-4">
      <div className="text-lg font-medium leading-6 text-gray-900">
        Danger zone
      </div>

      <div className="flex flex-row items-center">
        <div className="mt-2 inline-block text-sm font-normal leading-5 text-gray-500">
          This action can not be reversed. Are you sure you want to delete this{' '}
          {props.elementType}?
        </div>

        <Tooltip
          content={TOOLTIPS_DICT.GENERAL.CANNOT_BE_REVERTED}
          placement="right"
          color="invert"
        >
          <button
            onClick={() =>
              dispatch(
                setModalStates(ModalEnum.DELETE_ELEMENT, {
                  open: true,
                  id: props.id,
                }),
              )
            }
            className="ml-6 h-9 cursor-pointer rounded-md border border-red-400 bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete {props.name}
          </button>
        </Tooltip>
      </div>
      <DeleteElementModal
        id={props.id}
        name={props.name}
        elementType={props.elementType}
      />
    </div>
  )
}
