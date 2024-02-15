import Modal from '@/src/components/shared/modal/Modal'
import { selectModal } from '@/src/reduxStore/states/modal'
import { removeFromAllLabelingTasksById } from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { DELETE_LABELING_TASK } from '@/src/services/gql/mutations/project-settings'
import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const ABORT_BUTTON = {
  buttonCaption: 'Delete labeling task',
  disabled: false,
  useButton: true,
}

export default function DeleteLabelingTaskModal() {
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const modalDeleteLabelingTask = useSelector(
    selectModal(ModalEnum.DELETE_LABELING_TASK),
  )

  const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON)

  const [deleteLabelingTaskMut] = useMutation(DELETE_LABELING_TASK)

  const deleteLabelingTask = useCallback(() => {
    deleteLabelingTaskMut({
      variables: {
        projectId: projectId,
        labelingTaskId: modalDeleteLabelingTask.taskId,
      },
    }).then((res) => {
      dispatch(removeFromAllLabelingTasksById(modalDeleteLabelingTask.taskId))
    })
  }, [modalDeleteLabelingTask])

  useEffect(() => {
    setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteLabelingTask })
  }, [modalDeleteLabelingTask])

  return (
    <Modal modalName={ModalEnum.DELETE_LABELING_TASK} abortButton={abortButton}>
      <div className="flex flex-grow justify-center text-lg font-medium leading-6 text-gray-900">
        Warning{' '}
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Are you sure you want to delete this labeling task?
      </p>
      <p className="text-sm text-gray-500">
        This will delete all data associated with it, including heuristics and
        labels!
      </p>
    </Modal>
  )
}
