import {
  selectLabelingTasksAll,
  setLabelingTasksAll,
} from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { GET_MODEL_CALLBACKS_OVERVIEW_DATA } from '@/src/services/gql/queries/model-callbacks'
import { GET_LABELING_TASKS_BY_PROJECT_ID } from '@/src/services/gql/queries/project-setting'
import { LabelingTask } from '@/src/types/components/projects/projectId/settings/labeling-tasks'
import {
  ACTIONS_DROPDOWN_OPTIONS,
  postProcessModelCallbacks,
} from '@/src/util/components/projects/projectId/model-callbacks-helper'
import {
  postProcessLabelingTasks,
  postProcessLabelingTasksSchema,
} from '@/src/util/components/projects/projectId/settings/labeling-tasks-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { useLazyQuery } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { IconPlus } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import style from '@/src/styles/components/projects/projectId/model-callbacks.module.css'
import { ModalEnum } from '@/src/types/shared/modal'
import { openModal, selectModal } from '@/src/reduxStore/states/modal'
import { CurrentPage } from '@/src/types/shared/general'
import GridCards from '@/src/components/shared/grid-cards/GridCards'
import DeleteModelCallBacksModal from './DeleteModelCallbacksModal'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket'

export default function ModelCallbacks() {
  const dispatch = useDispatch()
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const labelingTasks = useSelector(selectLabelingTasksAll)
  const modalDelete = useSelector(selectModal(ModalEnum.DELETE_MODEL_CALLBACKS))

  const [openTab, setOpenTab] = useState(-1)
  const [modelCallbacks, setModelCallbacks] = useState([])
  const [checkedModelCallbacks, setCheckedModelCallbacks] = useState([])
  const [selectionList, setSelectionList] = useState('')
  const [countSelected, setCountSelected] = useState(0)
  const [filteredList, setFilteredList] = useState([])

  const [refetchLabelingTasksByProjectId] = useLazyQuery(
    GET_LABELING_TASKS_BY_PROJECT_ID,
    { fetchPolicy: 'network-only' },
  )
  const [refetchModelCallbacks] = useLazyQuery(
    GET_MODEL_CALLBACKS_OVERVIEW_DATA,
    { fetchPolicy: 'network-only' },
  )

  useEffect(() => {
    prepareSelectionList()
  }, [modalDelete])

  useEffect(() => {
    if (!projectId) return
    refetchLabelingTasksAndProcess()
    refetchModelCallbacksAndProcess()
  }, [projectId])

  function toggleTabs(index: number, labelingTask: LabelingTask | null) {
    setOpenTab(index)
    setFilteredList(
      labelingTask != null
        ? modelCallbacks.filter(
            (modelCallback) => modelCallback.labelingTaskId == labelingTask.id,
          )
        : modelCallbacks,
    )
  }

  function refetchLabelingTasksAndProcess() {
    refetchLabelingTasksByProjectId({
      variables: { projectId: projectId },
    }).then((res) => {
      const labelingTasks = postProcessLabelingTasks(
        res['data']['projectByProjectId']['labelingTasks']['edges'],
      )
      dispatch(
        setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)),
      )
    })
  }

  function refetchModelCallbacksAndProcess() {
    refetchModelCallbacks({ variables: { projectId: projectId } }).then(
      (res) => {
        const modelCallbacks = postProcessModelCallbacks(
          res['data']['modelCallbacksOverviewData'],
        )
        setModelCallbacks(modelCallbacks)
        setFilteredList(modelCallbacks)
      },
    )
  }

  function executeOption(option: string) {
    switch (option) {
      case 'Select all':
        selectModelCallbacks(true)
        break
      case 'Deselect all':
        selectModelCallbacks(false)
        break
      case 'Delete selected':
        prepareSelectionList()
        dispatch(openModal(ModalEnum.DELETE_MODEL_CALLBACKS))
        break
    }
  }

  function selectModelCallbacks(checked: boolean) {
    setCheckedModelCallbacks(Array(modelCallbacks.length).fill(checked))
    prepareSelectionList()
  }

  function prepareSelectionList() {
    let selectionListFinal = ''
    let countSelected = 0
    checkedModelCallbacks.forEach((checked, index) => {
      if (checked) {
        selectionListFinal += modelCallbacks[index].name
        selectionListFinal += '\n'
        countSelected++
      }
    })
    setCountSelected(countSelected)
    setSelectionList(selectionListFinal)
  }

  const handleWebsocketNotification = useCallback((msgParts: string[]) => {
    if (
      ['labeling_task_updated', 'labeling_task_created'].includes(msgParts[1])
    ) {
      refetchLabelingTasksAndProcess()
    }
    if ('labeling_task_deleted' == msgParts[1]) {
      refetchLabelingTasksAndProcess
    }
    if (
      [
        'information_source_created',
        'information_source_updated',
        'information_source_deleted',
        'model_callback_update_statistics',
      ]
    ) {
      refetchModelCallbacksAndProcess()
    }
  }, [])

  useWebsocket(
    CurrentPage.MODEL_CALLBACKS,
    handleWebsocketNotification,
    projectId,
  )

  return (
    projectId && (
      <div className="flex h-full flex-1 flex-col bg-gray-100 p-4">
        <div className="h-full w-full">
          <div className="block flex-shrink-0 items-center justify-between xl:flex">
            <div
              className={`flex ${style.widthLine} max-w-full overflow-x-auto border-b-2 border-b-gray-200`}
            >
              <div
                className={`mr-10 cursor-pointer py-5 text-sm font-medium leading-5 ${openTab == -1 ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`}
                onClick={() => toggleTabs(-1, null)}
              >
                All
              </div>
              {labelingTasks &&
                labelingTasks.map((labelingTask, index) => (
                  <div key={labelingTask.id}>
                    <div
                      className={`mr-10 cursor-pointer py-5 text-sm font-medium leading-5 ${openTab == index ? 'text-indigo-700 ' + style.borderBottom : 'text-gray-500'}`}
                      onClick={() => toggleTabs(index, labelingTask)}
                    >
                      {labelingTask.name}
                    </div>
                  </div>
                ))}
              <Tooltip
                color="invert"
                placement="right"
                content={TOOLTIPS_DICT.MODEL_CALLBACKS.ADD_LABELING_TASK}
              >
                <button
                  onClick={() => {
                    localStorage.setItem('openModal', 'true')
                    router.push(`/projects/${projectId}/settings`)
                  }}
                >
                  <IconPlus
                    size={20}
                    strokeWidth={1.5}
                    className="cursor-pointer text-gray-500"
                  />
                </button>
              </Tooltip>
            </div>
            <div className="mt-2 grid grid-cols-1 flex-row items-center gap-4 xs:flex xs:gap-0 xl:mt-0">
              {modelCallbacks && modelCallbacks.length > 0 ? (
                <Dropdown2
                  options={ACTIONS_DROPDOWN_OPTIONS}
                  buttonName="Actions"
                  disabledOptions={[
                    false,
                    false,
                    modelCallbacks.every((checked) => !checked),
                  ]}
                  iconsArray={['IconSquareCheck', 'IconSquare', 'IconTrash']}
                  selectedOption={(option: string) => executeOption(option)}
                  dropdownClasses="mr-3"
                  buttonClasses={`${style.actionsHeight} text-xs`}
                />
              ) : (
                <Tooltip
                  placement="left"
                  content={TOOLTIPS_DICT.MODEL_CALLBACKS.ENABLE_ACTIONS}
                  color="invert"
                >
                  <button
                    type="button"
                    disabled={true}
                    className="mr-3 inline-flex w-full cursor-not-allowed items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 opacity-50 shadow-sm focus:ring-offset-2 focus:ring-offset-gray-400"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                  >
                    Actions
                    <svg
                      className="-mr-1 ml-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </Tooltip>
              )}

              <div className="flex justify-center overflow-visible">
                <Tooltip
                  placement="left"
                  content={TOOLTIPS_DICT.MODEL_CALLBACKS.NAVIGATE_HEURISTICS}
                  color="invert"
                >
                  <a
                    href={`/refinery/projects/${projectId}/heuristics`}
                    onClick={(e: any) => {
                      e.preventDefault()
                      router.push(`/projects/${projectId}/heuristics`)
                    }}
                    className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Heuristics
                  </a>
                </Tooltip>
              </div>

              <div className="flex justify-center overflow-visible">
                <Tooltip
                  placement="left"
                  content={TOOLTIPS_DICT.MODEL_CALLBACKS.NAVIGATE_LOOKUP_LISTS}
                  color="invert"
                >
                  <a
                    href={`/refinery/projects/${projectId}/lookup-lists`}
                    onClick={(e: any) => {
                      e.preventDefault()
                      router.push(`/projects/${projectId}/lookup-lists`)
                    }}
                    className=" mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Lookup lists
                  </a>
                </Tooltip>
              </div>
            </div>
          </div>

          {modelCallbacks?.length == 0 ? (
            <div className="mt-8 font-normal text-gray-500">
              <p className="text-xl leading-7">
                Seems like your project has no callbacks yet.
              </p>
              <p className="mt-3 text-base leading-6">
                You can create one from the{' '}
                <a
                  href="https://github.com/code-kern-ai/refinery-python-sdk"
                  target="_blank"
                >
                  <span className="cursor-pointer underline">Python SDK</span>
                </a>
                , if you want to dive deeper.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-y-auto" style={{ maxHeight: '93%' }}>
                <div
                  className={`mt-8 ${filteredList.length > 3 ? style.flexContainer : 'grid grid-cols-3 gap-6'}`}
                >
                  {filteredList.length == 0 && (
                    <span className="mt-4 text-base font-normal leading-6 text-gray-500">
                      No model callbacks for this labeling task
                    </span>
                  )}
                  <GridCards
                    filteredList={filteredList}
                    refetch={refetchModelCallbacksAndProcess}
                  />
                </div>
              </div>

              <DeleteModelCallBacksModal
                modelCallBacks={modelCallbacks}
                checkedModelCallbacks={checkedModelCallbacks}
                countSelected={countSelected}
                selectionList={selectionList}
                removeModelCallBack={(modelId: string) => {
                  setModelCallbacks(
                    modelCallbacks.filter(
                      (modelCallback) => modelCallback.id != modelId,
                    ),
                  )
                  setFilteredList(
                    filteredList.filter(
                      (modelCallback) => modelCallback.id != modelId,
                    ),
                  )
                }}
              />
            </>
          )}
        </div>
      </div>
    )
  )
}
