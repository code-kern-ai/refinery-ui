import {
  selectHeuristic,
  setActiveHeuristics,
  updateHeuristicsState,
} from '@/src/reduxStore/states/pages/heuristics'
import { useDispatch, useSelector } from 'react-redux'
import HeuristicsLayout from '../shared/HeuristicsLayout'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_HEURISTICS_BY_ID } from '@/src/services/gql/queries/heuristics'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  GET_LABELING_TASKS_BY_PROJECT_ID,
  GET_ZERO_SHOT_RECOMMENDATIONS,
} from '@/src/services/gql/queries/project-setting'
import {
  postProcessLabelingTasks,
  postProcessLabelingTasksSchema,
} from '@/src/util/components/projects/projectId/settings/labeling-tasks-helper'
import {
  selectLabelingTasksAll,
  selectTextAttributes,
  setLabelingTasksAll,
} from '@/src/reduxStore/states/pages/settings'
import { CurrentPage } from '@/src/types/shared/general'
import {
  CONFIDENCE_INTERVALS,
  parseToSettingsJson,
  postProcessZeroShot,
} from '@/src/util/components/projects/projectId/heuristics/heuristicId/zero-shot-helper'
import { UPDATE_INFORMATION_SOURCE } from '@/src/services/gql/mutations/heuristics'
import { LabelingTaskTarget } from '@/src/types/components/projects/projectId/settings/labeling-tasks'
import { Tooltip } from '@nextui-org/react'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import { ZeroShotSettings } from '@/src/types/components/projects/projectId/heuristics/heuristicId/zero-shot'
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import {
  selectAllUsers,
  selectIsManaged,
  setComments,
} from '@/src/reduxStore/states/general'
import { IconArrowAutofitDown } from '@tabler/icons-react'
import Playground from './Playground'
import HeuristicStatistics from '../shared/HeuristicStatistics'
import DangerZone from '@/src/components/shared/danger-zone/DangerZone'
import { DangerZoneEnum } from '@/src/types/shared/danger-zone'
import CalculationProgress from './CalculationProgress'
import { Status } from '@/src/types/shared/statuses'
import { REQUEST_COMMENTS } from '@/src/services/gql/queries/projects'
import { CommentType } from '@/src/types/shared/comments'
import { CommentDataManager } from '@/src/util/classes/comments'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket'

export default function ZeroShot() {
  const dispatch = useDispatch()
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const currentHeuristic = useSelector(selectHeuristic)
  const labelingTasks = useSelector(selectLabelingTasksAll)
  const textAttributes = useSelector(selectTextAttributes)
  const isManaged = useSelector(selectIsManaged)
  const allUsers = useSelector(selectAllUsers)

  const [isModelDownloading, setIsModelDownloading] = useState(false)
  const [models, setModels] = useState([])
  const [confidences, setConfidences] = useState<any[]>(CONFIDENCE_INTERVALS)

  const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID, {
    fetchPolicy: 'network-only',
  })
  const [refetchLabelingTasksByProjectId] = useLazyQuery(
    GET_LABELING_TASKS_BY_PROJECT_ID,
    { fetchPolicy: 'network-only' },
  )
  const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE)
  const [refetchZeroShotRecommendations] = useLazyQuery(
    GET_ZERO_SHOT_RECOMMENDATIONS,
    { fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' },
  )
  const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, {
    fetchPolicy: 'no-cache',
  })

  useEffect(() => {
    setConfidences(
      CONFIDENCE_INTERVALS.map((conf) => {
        return { value: conf, label: conf + '%' }
      }),
    )
  }, [])

  useEffect(() => {
    if (!projectId) return
    if (!router.query.heuristicId) return
    refetchLabelingTasksAndProcess()
    refetchZeroShotRecommendations({
      variables: { projectId: projectId },
    }).then((res) => {
      setModels(JSON.parse(res.data['zeroShotRecommendations']))
    })
  }, [projectId, router.query.heuristicId])

  useEffect(() => {
    if (!projectId) return
    if (!labelingTasks) return
    refetchCurrentHeuristicAndProcess()
  }, [labelingTasks])

  useEffect(() => {
    if (!projectId || allUsers.length == 0) return
    setUpCommentsRequests()
  }, [allUsers, projectId])

  function setUpCommentsRequests() {
    const requests = []
    requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId })
    requests.push({
      commentType: CommentType.LABELING_TASK,
      projectId: projectId,
    })
    requests.push({ commentType: CommentType.HEURISTIC, projectId: projectId })
    requests.push({ commentType: CommentType.LABEL, projectId: projectId })
    CommentDataManager.unregisterCommentRequests(CurrentPage.ZERO_SHOT)
    CommentDataManager.registerCommentRequests(CurrentPage.ZERO_SHOT, requests)
    const requestJsonString = CommentDataManager.buildRequestJSON()
    refetchComments({ variables: { requested: requestJsonString } }).then(
      (res) => {
        CommentDataManager.parseCommentData(
          JSON.parse(res.data['getAllComments']),
        )
        CommentDataManager.parseToCurrentData(allUsers)
        dispatch(setComments(CommentDataManager.currentDataOrder))
      },
    )
  }

  function refetchCurrentHeuristicAndProcess() {
    refetchCurrentHeuristic({
      variables: {
        projectId: projectId,
        informationSourceId: router.query.heuristicId,
      },
    }).then((res) => {
      dispatch(
        setActiveHeuristics(
          postProcessZeroShot(
            res['data']['informationSourceBySourceId'],
            labelingTasks,
            textAttributes,
          ),
        ),
      )
    })
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

  function saveHeuristic(
    labelingTaskParam?: any,
    zeroShotSettings?: ZeroShotSettings,
  ) {
    const labelingTask = labelingTaskParam
      ? labelingTaskParam.id
      : currentHeuristic.zeroShotSettings.taskId
    const code = parseToSettingsJson(
      zeroShotSettings ? zeroShotSettings : currentHeuristic.zeroShotSettings,
    )
    updateHeuristicMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        labelingTaskId: labelingTask,
        code: code,
      },
    }).then((res) => {
      dispatch(
        updateHeuristicsState(currentHeuristic.id, {
          zeroShotSettings: zeroShotSettings
            ? zeroShotSettings
            : currentHeuristic.zeroShotSettings,
          labelingTaskId: labelingTask.id,
          labelingTaskName: labelingTask.name,
          labels: labelingTask.labels,
        }),
      )
    })
  }

  function changeZeroShotSettings(
    attributeName: string,
    newValue: any,
    saveToDb: boolean = true,
  ) {
    const zeroShotSettingsCopy = jsonCopy(currentHeuristic.zeroShotSettings)
    if (attributeName == 'excludedLabels') {
      if (currentHeuristic.zeroShotSettings.excludedLabels.includes(newValue)) {
        zeroShotSettingsCopy.excludedLabels =
          zeroShotSettingsCopy.excludedLabels.filter((id) => id != newValue)
        dispatch(
          updateHeuristicsState(currentHeuristic.id, {
            zeroShotSettings: zeroShotSettingsCopy,
          }),
        )
      } else {
        zeroShotSettingsCopy.excludedLabels.push(newValue)
        dispatch(
          updateHeuristicsState(currentHeuristic.id, {
            zeroShotSettings: zeroShotSettingsCopy,
          }),
        )
      }
    } else if (attributeName == 'targetConfig') {
      zeroShotSettingsCopy.targetConfig = newValue
    } else {
      if (attributeName == 'minConfidence')
        zeroShotSettingsCopy.minConfidence = newValue / 100
      dispatch(
        updateHeuristicsState(currentHeuristic.id, {
          zeroShotSettings: { [attributeName]: newValue },
        }),
      )
      if (attributeName == 'taskId') {
        const labelingTask = labelingTasks.find(
          (a) => a.id == currentHeuristic.zeroShotSettings.taskId,
        )
        dispatch(
          updateHeuristicsState(currentHeuristic.id, {
            zeroShotSettings: {
              attributeSelectDisabled:
                textAttributes.length == 1 ||
                labelingTask.taskTarget === LabelingTaskTarget.ON_ATTRIBUTE,
            },
          }),
        )
      }
    }
    if (saveToDb) saveHeuristic(null, zeroShotSettingsCopy)
  }

  const handleWebsocketNotification = useCallback(
    (msgParts: string[]) => {
      if (!currentHeuristic) return
      if (
        [
          'labeling_task_updated',
          'labeling_task_created',
          'label_created',
          'label_deleted',
        ].includes(msgParts[1])
      ) {
        refetchLabelingTasksAndProcess()
      } else if ('labeling_task_deleted' == msgParts[1]) {
        alert('Parent labeling task was deleted!')
        router.push(`/projects/${projectId}/heuristics`)
      } else if ('information_source_deleted' == msgParts[1]) {
        alert('Information source was deleted!')
        router.push(`/projects/${projectId}/heuristics`)
      } else if ('information_source_updated' == msgParts[1]) {
        if (currentHeuristic.id == msgParts[2]) {
          refetchCurrentHeuristicAndProcess()
        }
      } else if ('zero_shot_download' == msgParts[1]) {
        if (currentHeuristic.id == msgParts[3]) {
          if ('started' == msgParts[2]) setIsModelDownloading(true)
          if ('finished' == msgParts[2]) setIsModelDownloading(false)
        }
      } else if (msgParts[1] == 'zero-shot') {
        if (currentHeuristic.lastPayload?.id != msgParts[2]) return
        if (msgParts[3] == 'progress') {
          dispatch(
            updateHeuristicsState(currentHeuristic.id, {
              lastTask: {
                progress: Number(msgParts[4]),
                state: Status.CREATED,
                id: msgParts[2],
                iteration: currentHeuristic.lastPayload
                  ? currentHeuristic.lastPayload.iteration
                  : 1,
              },
            }),
          )
        } else if (msgParts[3] == 'state') {
          if (msgParts[4] == Status.FINISHED) {
            refetchCurrentHeuristicAndProcess()
          } else {
            dispatch(
              updateHeuristicsState(currentHeuristic.id, {
                lastTask: {
                  state: msgParts[4],
                  iteration: currentHeuristic.lastPayload.iteration,
                },
                state: msgParts[4],
              }),
            )
          }
        }
      }
    },
    [currentHeuristic],
  )

  useWebsocket(CurrentPage.ZERO_SHOT, handleWebsocketNotification, projectId)

  return (
    <HeuristicsLayout>
      {currentHeuristic && (
        <div>
          {currentHeuristic.zeroShotSettings && (
            <div className="mt-8 text-sm leading-5 text-gray-700">
              <div className="font-medium">Settings</div>
              <div className="mt-2 font-normal">Labeling task</div>
              <div className="relative flex min-h-16 flex-shrink-0 justify-between pb-2">
                <div className="mt-3 flex flex-wrap items-center">
                  <Tooltip
                    content={TOOLTIPS_DICT.ZERO_SHOT.LABELING_TASK}
                    color="invert"
                    placement="top"
                  >
                    <Dropdown2
                      options={labelingTasks}
                      buttonName={currentHeuristic?.labelingTaskName}
                      selectedOption={(option: any) => saveHeuristic(option)}
                    />
                  </Tooltip>
                  {currentHeuristic.labels?.length == 0 ? (
                    <div className="ml-3 text-sm font-normal text-gray-500">
                      No labels for target task
                    </div>
                  ) : (
                    <>
                      {currentHeuristic.labels?.map(
                        (label: any, index: number) => (
                          <span
                            key={label.id}
                            onClick={() =>
                              changeZeroShotSettings('excludedLabels', label.id)
                            }
                            className={`ml-3 inline-flex cursor-pointer items-center rounded border px-2 py-0.5 text-xs font-medium ${label.color.backgroundColor} ${label.color.hoverColor} ${label.color.textColor} ${label.color.borderColor}`}
                          >
                            <span className="mr-3 font-medium">
                              {label.name}
                            </span>
                            <span className="pb-0.5">
                              <input
                                className="cursor-pointer align-middle"
                                type="checkbox"
                                defaultChecked={
                                  !currentHeuristic.zeroShotSettings.excludedLabels?.includes(
                                    label.id,
                                  )
                                }
                              />
                            </span>
                          </span>
                        ),
                      )}
                    </>
                  )}
                </div>
              </div>

              <div
                className="mt-3 grid items-center gap-x-4 gap-y-2"
                style={{
                  gridTemplateColumns: 'max-content max-content max-content',
                }}
              >
                <div className="font-normal">Input attribute</div>
                {!isModelDownloading ? (
                  <div className="flex h-6 items-center font-normal">
                    Model
                    <Tooltip
                      content={
                        !isManaged
                          ? TOOLTIPS_DICT.ZERO_SHOT.HOSTED_VERSION
                          : TOOLTIPS_DICT.ZERO_SHOT.NAVIGATE_MODELS_DOWNLOADED
                      }
                      color="invert"
                      placement="right"
                    >
                      <button
                        disabled={!isManaged}
                        onClick={() => router.push('/models-download')}
                        className="ml-1 inline-block cursor-pointer items-center rounded-md border border-gray-300 bg-white text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <IconArrowAutofitDown className="mr-1 inline-block h-5 w-5" />
                      </button>
                    </Tooltip>
                  </div>
                ) : (
                  <div className="inline-flex items-center font-normal">
                    Model Downloading <LoadingIcon />
                  </div>
                )}
                <div className="font-normal">Required model confidence</div>
                <Tooltip
                  content={TOOLTIPS_DICT.ZERO_SHOT.INPUT_ATTRIBUTE}
                  color="invert"
                  placement="top"
                >
                  <Dropdown2
                    options={textAttributes}
                    buttonName={currentHeuristic.zeroShotSettings.attributeName}
                    disabled={
                      currentHeuristic.zeroShotSettings.attributeSelectDisabled
                    }
                    selectedOption={(option: any) => {
                      changeZeroShotSettings('attributeId', option.id)
                    }}
                  />
                </Tooltip>
                <Tooltip
                  content={TOOLTIPS_DICT.ZERO_SHOT.MODEL}
                  color="invert"
                  placement="top"
                >
                  <Dropdown2
                    options={models}
                    buttonName={
                      currentHeuristic?.zeroShotSettings?.targetConfig
                    }
                    valuePropertyPath="configString"
                    selectedOption={(option: any) =>
                      changeZeroShotSettings(
                        'targetConfig',
                        option.configString,
                      )
                    }
                  />
                </Tooltip>
                <Tooltip
                  content={TOOLTIPS_DICT.ZERO_SHOT.CONFIDENCE}
                  color="invert"
                  placement="top"
                >
                  <Dropdown2
                    options={confidences}
                    buttonName={
                      currentHeuristic.zeroShotSettings.minConfidence * 100 +
                      '%'
                    }
                    selectedOption={(option: any) => {
                      changeZeroShotSettings('minConfidence', option.value)
                    }}
                  />
                </Tooltip>
              </div>

              <Playground
                setIsModelDownloading={(val: boolean) =>
                  setIsModelDownloading(val)
                }
              />

              <CalculationProgress />

              <HeuristicStatistics />

              <DangerZone
                elementType={DangerZoneEnum.ZERO_SHOT}
                id={currentHeuristic.id}
                name={currentHeuristic.name}
              />
            </div>
          )}
        </div>
      )}
    </HeuristicsLayout>
  )
}
