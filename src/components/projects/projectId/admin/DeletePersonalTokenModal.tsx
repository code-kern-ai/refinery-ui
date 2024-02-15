import Modal from '@/src/components/shared/modal/Modal'
import { selectModal } from '@/src/reduxStore/states/modal'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { DELETE_PERSONAL_ACCESS_TOKEN } from '@/src/services/gql/mutations/project-admin'
import { PersonalTokenModalProps } from '@/src/types/components/projects/projectId/project-admin'
import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const ABORT_BUTTON = {
  buttonCaption: 'Delete personal access token',
  useButton: true,
  disabled: false,
}

export default function DeletePersonalToken(props: PersonalTokenModalProps) {
  const projectId = useSelector(selectProjectId)
  const modalDeleteToken = useSelector(
    selectModal(ModalEnum.DELETE_PERSONAL_TOKEN),
  )

  const [deletePersonalTokenMut] = useMutation(DELETE_PERSONAL_ACCESS_TOKEN)

  const deletePersonalToken = useCallback(() => {
    deletePersonalTokenMut({
      variables: { projectId: projectId, tokenId: modalDeleteToken.tokenId },
    }).then((res) => {
      props.refetchTokens()
    })
  }, [modalDeleteToken.tokenId, projectId])

  const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON)

  useEffect(() => {
    setAbortButton({ ...ABORT_BUTTON, emitFunction: deletePersonalToken })
  }, [modalDeleteToken])

  return (
    <Modal
      modalName={ModalEnum.DELETE_PERSONAL_TOKEN}
      abortButton={abortButton}
    >
      <div className="flex flex-grow justify-center text-lg font-medium leading-6 text-gray-900">
        Warning
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Are you sure you want to delete this personal access token?
      </p>
      <p className="text-sm font-bold text-gray-500">
        This is not reversible and the token will not be longer usable!
      </p>
    </Modal>
  )
}
