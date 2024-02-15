import Modal from '@/src/components/shared/modal/Modal'
import {
  closeModal,
  selectModal,
  setModalStates,
} from '@/src/reduxStore/states/modal'
import { selectUsableNonTextAttributes } from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { UPDATE_EMBEDDING_PAYLOAD } from '@/src/services/gql/mutations/project-settings'
import { FilterAttributesModalProps } from '@/src/types/components/projects/projectId/settings/embeddings'
import { ModalEnum } from '@/src/types/shared/modal'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useMutation } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function FilterAttributesModal(
  props: FilterAttributesModalProps,
) {
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const modalFilteredAttributes = useSelector(
    selectModal(ModalEnum.FILTERED_ATTRIBUTES),
  )
  const usableAttributes = useSelector(selectUsableNonTextAttributes)

  const [checkedAttributes, setCheckedAttributes] = useState([])

  const [updateEmbeddingPayloadMut] = useMutation(UPDATE_EMBEDDING_PAYLOAD)

  function editFilteredAttributes() {
    props.setShowEditOption(true)
    dispatch(
      setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { showEditOption: true }),
    )
  }

  function saveFilteredAttributes() {
    props.setShowEditOption(false)
    dispatch(
      setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { showEditOption: false }),
    )
    updateEmbeddingPayloadMut({
      variables: {
        projectId: projectId,
        embeddingId: modalFilteredAttributes.embeddingId,
        filterAttributes: JSON.stringify(props.filterAttributesUpdate),
      },
    }).then((res) => {})
  }

  useEffect(() => {
    if (!usableAttributes) return
    if (!modalFilteredAttributes.attributeNames) return
    const updated = usableAttributes.map((attribute) => {
      const attributeCopy = { ...attribute }
      attributeCopy.checked =
        modalFilteredAttributes.attributeNames.find(
          (a) => a.name == attribute.name,
        ) != undefined
      return attributeCopy
    })
    setCheckedAttributes(updated)
  }, [usableAttributes, modalFilteredAttributes])

  return (
    <Modal modalName={ModalEnum.FILTERED_ATTRIBUTES} hasOwnButtons={true}>
      <div className="flex flex-grow justify-center text-lg font-medium leading-6 text-gray-900">
        Edit embedding with filter attributes
      </div>
      <div className="my-2 flex flex-grow justify-center text-center text-sm text-gray-500">
        List of filter attributes selected when creating an embedding
      </div>
      {modalFilteredAttributes.attributeNames &&
      modalFilteredAttributes.attributeNames.length == 0 ? (
        <div className="text-center text-xs italic text-gray-500">
          No filter attributes selected
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {modalFilteredAttributes.attributeNames.map((attribute) => (
            <Tooltip
              content={attribute.dataType}
              color="invert"
              placement="top"
              key={attribute.id}
              className="cursor-auto"
            >
              <span
                className={`mr-2 items-center rounded border px-2 py-0.5 text-center text-xs font-medium bg-${attribute.color}-100 text-${attribute.color}-700 border-${attribute.color}-400 hover:bg-${attribute.color}-200`}
              >
                {attribute.name}
              </span>
            </Tooltip>
          ))}
        </div>
      )}
      {modalFilteredAttributes.showEditOption && (
        <div className="mt-3">
          <div className="text-center text-xs italic text-gray-500">
            Add or remove filter attributes
          </div>
          <Dropdown2
            options={usableAttributes}
            buttonName={
              props.filterAttributesUpdate.length == 0
                ? 'None selected'
                : props.filterAttributesUpdate.join(',')
            }
            hasCheckboxes={true}
            selectedCheckboxes={checkedAttributes.map((a) => a.checked)}
            hasSelectAll={true}
            selectedOption={(option: any) => {
              const attributes = option
                .filter((o: any) => o.checked)
                .map((o: any) => o.name)
              props.setFilterAttributesUpdate(attributes)
            }}
          />
        </div>
      )}
      <div className="mt-6 flex justify-end">
        {!props.showEditOption && (
          <button
            onClick={editFilteredAttributes}
            className="ml-2 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit
          </button>
        )}
        {props.showEditOption && (
          <button
            onClick={saveFilteredAttributes}
            className="ml-2 cursor-pointer rounded-md border border-green-400 bg-green-100 px-4 py-2 text-xs font-semibold text-green-700 opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        )}
        <button
          onClick={() => dispatch(closeModal(ModalEnum.FILTERED_ATTRIBUTES))}
          className="ml-2 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
