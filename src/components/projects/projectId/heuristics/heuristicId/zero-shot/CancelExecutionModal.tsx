import Modal from '@/src/components/shared/modal/Modal'
import { selectModal } from '@/src/reduxStore/states/modal'
import {
  selectHeuristic,
  updateHeuristicsState,
} from '@/src/reduxStore/states/pages/heuristics'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { CANCEL_ZERO_SHOT_RUN } from '@/src/services/gql/mutations/heuristics'
import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import { Status } from '@/src/types/shared/statuses'
import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const ABORT_BUTTON = {
  buttonCaption: 'Cancel',
  useButton: true,
  disabled: false,
}

export default function CancelExecutionModal() {
  const dispatch = useDispatch()
  const projectId = useSelector(selectProjectId)
  const currentHeuristic = useSelector(selectHeuristic)
  const modalCancel = useSelector(selectModal(ModalEnum.CANCEL_EXECUTION))

  const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON)

  const [cancelExecutionMut] = useMutation(CANCEL_ZERO_SHOT_RUN)

  const cancelExecution = useCallback(() => {
    cancelExecutionMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        payloadId: currentHeuristic.lastTask.id,
      },
    }).then(() => {
      dispatch(
        updateHeuristicsState(currentHeuristic.id, {
          lastTask: {
            state: Status.FAILED,
            iteration: currentHeuristic.lastPayload.iteration,
          },
          state: Status.FAILED,
        }),
      )
    })
  }, [modalCancel, projectId, currentHeuristic])

  useEffect(() => {
    setAbortButton({ ...abortButton, emitFunction: cancelExecution })
  }, [modalCancel])

  return (
    <Modal modalName={ModalEnum.CANCEL_EXECUTION} abortButton={abortButton}>
      <div className="flex flex-col items-center">
        <h1 className="mb-2 text-lg text-gray-900">Cancel Execution</h1>
        <div className="my-2 text-sm text-gray-500">
          Are you sure you want to cancel?
          <div>
            This will stop the execution and remove already created labels.
          </div>
        </div>
      </div>
    </Modal>
  )
}
