import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import { selectIsManaged } from '@/src/reduxStore/states/general'
import { openModal, setModalStates } from '@/src/reduxStore/states/modal'
import {
  selectAttributes,
  selectEmbeddings,
} from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import {
  Embedding,
  EmbeddingState,
} from '@/src/types/components/projects/projectId/settings/embeddings'
import { CurrentPage, CurrentPageSubKey } from '@/src/types/shared/general'
import { ModalEnum } from '@/src/types/shared/modal'
import {
  DATA_TYPES,
  getColorForDataType,
} from '@/src/util/components/projects/projectId/settings/data-schema-helper'
import { Tooltip } from '@nextui-org/react'
import {
  IconAlertTriangleFilled,
  IconArrowAutofitDown,
  IconCircleCheckFilled,
  IconNotes,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import AddNewEmbeddingModal from './AddNewEmbeddingModal'
import FilterAttributesModal from './FilterAttributesModal'
import DeleteEmbeddingModal from './DeleteEmbeddingModal'
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket'

export default function Embeddings() {
  const dispatch = useDispatch()
  const router = useRouter()

  const attributes = useSelector(selectAttributes)
  const isManaged = useSelector(selectIsManaged)
  const embeddings = useSelector(selectEmbeddings)
  const projectId = useSelector(selectProjectId)

  const [somethingLoading, setSomethingLoading] = useState(false)
  const [loadingEmbeddingsDict, setLoadingEmbeddingsDict] = useState<{
    [key: string]: boolean
  }>({})
  const [showEditOption, setShowEditOption] = useState(false)
  const [filterAttributesUpdate, setFilterAttributesUpdate] = useState([])

  useEffect(() => {
    if (!projectId) return
    setSomethingLoading(false)
  }, [])

  function prepareAttributeDataByNames(attributesNames: string[]) {
    if (!attributesNames) return []
    const attributesNew = []
    for (let name of attributesNames) {
      const attribute = attributes.find((a) => a.name == name)
      const attributeCopy = { ...attribute }
      attributeCopy.color = getColorForDataType(attribute.dataType)
      attributeCopy.dataTypeName = DATA_TYPES.find(
        (type) => type.value === attribute.dataType,
      ).name
      attributeCopy.checked = true
      attributesNew.push(attributeCopy)
    }
    setFilterAttributesUpdate(attributesNames)
    return attributesNew
  }

  const handleWebsocketNotification = useCallback((msgParts: string[]) => {
    if (msgParts[1] == 'embedding_updated') {
      const loadingEmbeddingsDictCopy = { ...loadingEmbeddingsDict }
      delete loadingEmbeddingsDictCopy[msgParts[2]]
      setLoadingEmbeddingsDict(loadingEmbeddingsDictCopy)
    } else if (msgParts[1] == 'upload_embedding_payload') {
      if (loadingEmbeddingsDict[msgParts[2]] == undefined) {
        const loadingEmbeddingsDictCopy = { ...loadingEmbeddingsDict }
        loadingEmbeddingsDictCopy[msgParts[2]] = true
        setLoadingEmbeddingsDict(loadingEmbeddingsDictCopy)
      }
    }
  }, [])

  useWebsocket(
    CurrentPage.PROJECT_SETTINGS,
    handleWebsocketNotification,
    projectId,
    CurrentPageSubKey.EMBEDDINGS,
  )
  return (
    <div className="mt-8">
      <div className="inline-block w-full text-lg font-medium leading-6 text-gray-900">
        <label>Embeddings</label>
        <div className="mt-1">
          <div className="inline-block text-sm font-medium leading-5 text-gray-700">
            You can enrich your records with embeddings, e.g. to use them for
            vector search or active transfer learning.
          </div>
          <div className="inline-block min-w-full align-middle">
            <div
              className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
              style={{ padding: '3px' }}
            >
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Filter attributes
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Dimensionality
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Count
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                    ></th>
                  </tr>
                </thead>
                {!somethingLoading ? (
                  <tbody className="divide-y divide-gray-200">
                    {embeddings.map((embedding: Embedding, index: number) => (
                      <tr
                        key={embedding.id}
                        className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          {embedding.name}
                        </td>
                        {!loadingEmbeddingsDict[embedding.id] ? (
                          <td className="flex justify-center whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                            <Tooltip
                              content={
                                embedding.filterAttributes &&
                                embedding.filterAttributes.length > 0
                                  ? TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS
                                      .HAS_FILTER_ATTRIBUTES
                                  : TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS
                                      .NO_FILTER_ATTRIBUTES
                              }
                              color="invert"
                            >
                              <IconNotes
                                onClick={() =>
                                  dispatch(
                                    setModalStates(
                                      ModalEnum.FILTERED_ATTRIBUTES,
                                      {
                                        embeddingId: embedding.id,
                                        open: true,
                                        attributeNames:
                                          prepareAttributeDataByNames(
                                            embedding.filterAttributes,
                                          ),
                                        showEditOption: showEditOption,
                                      },
                                    ),
                                  )
                                }
                                className={`h-6 w-6 ${embedding.filterAttributes && embedding.filterAttributes.length > 0 ? 'text-gray-700' : 'text-gray-300'}`}
                              />
                            </Tooltip>
                          </td>
                        ) : (
                          <td>
                            <LoadingIcon />
                          </td>
                        )}
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          <div className="inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            {embedding.state == EmbeddingState.QUEUED
                              ? ''
                              : embedding.type == 'ON_ATTRIBUTE'
                                ? 'Attribute Specific'
                                : 'Token Specific'}
                          </div>
                        </td>
                        <td
                          className={`px-3 text-center text-sm text-gray-500 ${embedding.state != EmbeddingState.FINISHED && embedding.state != EmbeddingState.FAILED ? 'py-0' : 'flex justify-center whitespace-nowrap py-2'}`}
                        >
                          {embedding.state != EmbeddingState.FINISHED &&
                            embedding.state != EmbeddingState.FAILED && (
                              <div>
                                <div className="items-center">
                                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                      className="h-2.5 rounded-full bg-green-500"
                                      style={{
                                        width: embedding.progress * 100 + '%',
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <p className="text-xs italic">
                                  {embedding.state}
                                </p>
                              </div>
                            )}
                          {embedding.state == EmbeddingState.FINISHED && (
                            <Tooltip
                              content={
                                TOOLTIPS_DICT.GENERAL.SUCCESSFULLY_CREATED
                              }
                              color="invert"
                              className="cursor-auto"
                            >
                              <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                            </Tooltip>
                          )}
                          {embedding.state == EmbeddingState.FAILED && (
                            <Tooltip
                              content={TOOLTIPS_DICT.GENERAL.ERROR}
                              color="invert"
                              className="cursor-auto"
                            >
                              <IconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                            </Tooltip>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          {embedding.dimension}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          {embedding.count}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          <IconTrash
                            onClick={() =>
                              dispatch(
                                setModalStates(ModalEnum.DELETE_EMBEDDING, {
                                  embeddingId: embedding.id,
                                  open: true,
                                  isQueuedElement:
                                    embedding.state == EmbeddingState.QUEUED,
                                }),
                              )
                            }
                            className="h-6 w-6 cursor-pointer text-red-700"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={6} className="p-1 text-center">
                        <LoadingIcon />
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Tooltip
            content={
              TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.GENERATE_EMBEDDING
            }
            color="invert"
            placement="right"
          >
            <button
              onClick={() => dispatch(openModal(ModalEnum.ADD_EMBEDDING))}
              className="inline-block cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              <IconPlus className="mr-1 inline-block h-5 w-5" />
              Generate embedding
            </button>
          </Tooltip>
          <Tooltip
            content={
              !isManaged
                ? TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS.HOSTED_VERSION
                : TOOLTIPS_DICT.PROJECT_SETTINGS.EMBEDDINGS
                    .NAVIGATE_MODELS_DOWNLOADED
            }
            color="invert"
            placement="right"
          >
            <button
              disabled={!isManaged}
              onClick={() => router.push('/models-download')}
              className={`"ml-1 inline-block cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <IconArrowAutofitDown className="mr-1 inline-block h-5 w-5" />
              See downloaded models
            </button>
          </Tooltip>
        </div>
      </div>

      <FilterAttributesModal
        showEditOption={showEditOption}
        setShowEditOption={(value) => setShowEditOption(value)}
        filterAttributesUpdate={filterAttributesUpdate}
        setFilterAttributesUpdate={(value) => setFilterAttributesUpdate(value)}
      />

      <DeleteEmbeddingModal />
      <AddNewEmbeddingModal />
    </div>
  )
}
