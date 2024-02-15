import Modal from '@/src/components/shared/modal/Modal'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { PASTE_TERM } from '@/src/services/gql/mutations/lookup-lists'
import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const ACCEPT_BUTTON = { buttonCaption: 'Add', useButton: true, disabled: false }

export default function PasteLookupListModal() {
  const router = useRouter()
  const projectId = useSelector(selectProjectId)

  const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON)
  const [inputSplit, setInputSplit] = useState('\\n')
  const [inputArea, setInputArea] = useState('')

  const [pasteLookupListMut] = useMutation(PASTE_TERM)

  const pasteLookupList = useCallback(() => {
    pasteLookupListMut({
      variables: {
        projectId: projectId,
        knowledgeBaseId: router.query.lookupListId,
        values: inputArea,
        split: inputSplit,
        delete: false,
      },
    }).then((res) => {
      setInputArea('')
    })
  }, [inputArea, inputSplit])

  useEffect(() => {
    setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: pasteLookupList })
  }, [inputArea, inputSplit])

  return (
    <Modal modalName={ModalEnum.PASTE_LOOKUP_LIST} acceptButton={acceptButton}>
      <h1 className="mb-2 text-center text-lg font-bold text-gray-900">
        Paste your terms
      </h1>
      <div
        className="grid items-center justify-center justify-items-start gap-x-2 gap-y-1"
        style={{ gridTemplateColumns: 'max-content min-content' }}
      >
        <span>Split On</span>
        <input
          value={inputSplit}
          type="text"
          onInput={(e: any) => setInputSplit(e.target.value)}
          className="placeholder-italic h-8 w-10 rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
        />
      </div>
      <div className="mt-3" style={{ maxHeight: '80vh' }}>
        <textarea
          value={inputArea}
          onInput={(e: any) => setInputArea(e.target.value)}
          placeholder="Paste your values here. No need to check for duplication, we do that for you."
          className="placeholder-italic h-72 w-full rounded-md border border-gray-300 p-4 pl-4 text-sm leading-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
        ></textarea>
      </div>
    </Modal>
  )
}
