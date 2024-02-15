import Modal from '@/src/components/shared/modal/Modal'
import {
  selectActiveSearchParams,
  selectSimilaritySearch,
} from '@/src/reduxStore/states/pages/data-browser'
import { selectEmbeddings } from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { CREATE_OUTLIER_SLICE } from '@/src/services/gql/mutations/data-browser'
import { Embedding } from '@/src/types/components/projects/projectId/settings/embeddings'
import { ModalButton, ModalEnum } from '@/src/types/shared/modal'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const ACCEPT_BUTTON = {
  buttonCaption: 'Search',
  disabled: true,
  useButton: true,
}

export default function CreateOutlierSliceModal() {
  const projectId = useSelector(selectProjectId)

  const activeSearchParams = useSelector(selectActiveSearchParams)
  const similaritySearch = useSelector(selectSimilaritySearch)
  const embeddings = useSelector(selectEmbeddings)

  const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null)
  const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON)

  const [createOutlierSliceMut] = useMutation(CREATE_OUTLIER_SLICE)

  const requestOutlierSlice = useCallback(() => {
    // const embeddingId = embeddings.find((embedding) => embedding.name == selectedEmbedding).id;
    createOutlierSliceMut({
      variables: { projectId: projectId, embeddingId: selectedEmbedding.id },
    }).then((res) => {})
  }, [selectedEmbedding])

  useEffect(() => {
    setAcceptButton({
      ...ACCEPT_BUTTON,
      emitFunction: requestOutlierSlice,
      disabled: selectedEmbedding == null,
    })
  }, [requestOutlierSlice, selectedEmbedding])

  return (
    <Modal
      modalName={ModalEnum.CREATE_OUTLIER_SLICE}
      acceptButton={acceptButton}
    >
      <div className="mb-3 flex flex-grow justify-center text-lg font-medium leading-6 text-gray-900">
        Select embedding for outlier search{' '}
      </div>
      {(activeSearchParams.length > 0 || similaritySearch.recordsInDisplay) && (
        <div className="mb-2 flex flex-grow justify-center text-sm text-red-500">
          Warning: your current filter selection will be removed!
        </div>
      )}

      <Dropdown2
        options={embeddings}
        buttonName={
          selectedEmbedding ? selectedEmbedding.name : 'Select embedding'
        }
        selectedOption={(option: any) => setSelectedEmbedding(option)}
      />
    </Modal>
  )
}
