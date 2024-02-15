import Modal from '@/src/components/shared/modal/Modal'
import { selectModal } from '@/src/reduxStore/states/modal'
import { selectHeuristicsAll } from '@/src/reduxStore/states/pages/heuristics'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { DELETE_HEURISTIC } from '@/src/services/gql/mutations/heuristics'
import { DeleteHeuristicsModalProps } from '@/src/types/components/projects/projectId/heuristics/heuristics'
import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const ABORT_BUTTON = {
  buttonCaption: 'Delete',
  useButton: true,
  disabled: false,
}

export default function DeleteHeuristicsModal(
  props: DeleteHeuristicsModalProps,
) {
  const projectId = useSelector(selectProjectId)
  const modalDelete = useSelector(selectModal(ModalEnum.DELETE_HEURISTICS))
  const heuristics = useSelector(selectHeuristicsAll)

  const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON)

  const [deleteHeuristicMut] = useMutation(DELETE_HEURISTIC)

  const deleteHeuristics = useCallback(() => {
    heuristics.forEach((heuristic) => {
      if (heuristic.selected) {
        deleteHeuristicMut({
          variables: {
            projectId: projectId,
            informationSourceId: heuristic.id,
          },
        }).then(() => props.refetch())
      }
    })
  }, [modalDelete])

  useEffect(() => {
    setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteHeuristics })
  }, [modalDelete])

  return (
    <Modal modalName={ModalEnum.DELETE_HEURISTICS} abortButton={abortButton}>
      <h1 className="mb-2 text-lg text-gray-900">Warning</h1>
      <div className="my-2 flex flex-col text-sm text-gray-500">
        <span>
          Are you sure you want to delete selected{' '}
          {props.countSelected <= 1 ? 'heuristic' : 'heuristics'}?
        </span>
        <span>
          Currently selected {props.countSelected <= 1 ? 'is' : 'are'}:
        </span>
        <span className="whitespace-pre-line font-bold">
          {props.selectionList}
        </span>
      </div>
    </Modal>
  )
}
