import { useRouter } from 'next/router'
import HeuristicsLayout from '../shared/HeuristicsLayout'
import { useDispatch, useSelector } from 'react-redux'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { useCallback, useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
  GET_HEURISTICS_BY_ID,
  GET_LABELING_FUNCTION_ON_10_RECORDS,
  GET_TASK_BY_TASK_ID,
} from '@/src/services/gql/queries/heuristics'
import {
  selectHeuristic,
  setActiveHeuristics,
  updateHeuristicsState,
} from '@/src/reduxStore/states/pages/heuristics'
import {
  postProcessCurrentHeuristic,
  postProcessLastTaskLogs,
} from '@/src/util/components/projects/projectId/heuristics/heuristicId/heuristics-details-helper'
import { Tooltip } from '@nextui-org/react'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { GET_LABELING_TASKS_BY_PROJECT_ID } from '@/src/services/gql/queries/project-setting'
import {
  postProcessLabelingTasks,
  postProcessLabelingTasksSchema,
} from '@/src/util/components/projects/projectId/settings/labeling-tasks-helper'
import {
  selectVisibleAttributesHeuristics,
  selectLabelingTasksAll,
  setLabelingTasksAll,
} from '@/src/reduxStore/states/pages/settings'
import { UPDATE_INFORMATION_SOURCE } from '@/src/services/gql/mutations/heuristics'
import HeuristicsEditor from '../shared/HeuristicsEditor'
import DangerZone from '@/src/components/shared/danger-zone/DangerZone'
import HeuristicRunButtons from '../shared/HeuristicRunButtons'
import ContainerLogs from '@/src/components/shared/logs/ContainerLogs'
import HeuristicStatistics from '../shared/HeuristicStatistics'
import { DangerZoneEnum } from '@/src/types/shared/danger-zone'
import { Status } from '@/src/types/shared/statuses'
import { postProcessSampleRecords } from '@/src/util/components/projects/projectId/heuristics/heuristicId/labeling-functions-helper'
import SampleRecords from './SampleRecords'
import { SampleRecord } from '@/src/types/components/projects/projectId/heuristics/heuristicId/labeling-function'
import { getPythonFunctionRegExMatch } from '@/submodules/javascript-functions/python-functions-parser'
import CalculationProgress from './CalculationProgress'
import { copyToClipboard } from '@/submodules/javascript-functions/general'
import { CurrentPage } from '@/src/types/shared/general'
import {
  selectAllUsers,
  setBricksIntegrator,
  setComments,
} from '@/src/reduxStore/states/general'
import { REQUEST_COMMENTS } from '@/src/services/gql/queries/projects'
import { CommentType } from '@/src/types/shared/comments'
import { CommentDataManager } from '@/src/util/classes/comments'
import BricksIntegrator from '@/src/components/shared/bricks-integrator/BricksIntegrator'
import {
  InformationSourceCodeLookup,
  InformationSourceExamples,
} from '@/src/util/classes/heuristics'
import { getInformationSourceTemplate } from '@/src/util/components/projects/projectId/heuristics/heuristics-helper'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { Attribute } from '@/src/types/components/projects/projectId/settings/data-schema'
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import { parseContainerLogsData } from '@/submodules/javascript-functions/logs-parser'
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket'

export default function LabelingFunction() {
  const dispatch = useDispatch()
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const currentHeuristic = useSelector(selectHeuristic)
  const labelingTasks = useSelector(selectLabelingTasksAll)
  const attributes = useSelector(selectVisibleAttributesHeuristics)
  const allUsers = useSelector(selectAllUsers)

  const [lastTaskLogs, setLastTaskLogs] = useState<string[]>([])
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute>(null)
  const [sampleRecords, setSampleRecords] = useState<SampleRecord>(null)
  const [displayLogWarning, setDisplayLogWarning] = useState<boolean>(false)
  const [isInitialLf, setIsInitialLf] = useState<boolean>(null) //null as add state to differentiate between initial, not and unchecked
  const [checkUnsavedChanges, setCheckUnsavedChanges] = useState(false)
  const [runOn10IsRunning, setRunOn10IsRunning] = useState(false)

  const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID, {
    fetchPolicy: 'network-only',
  })
  const [refetchLabelingTasksByProjectId] = useLazyQuery(
    GET_LABELING_TASKS_BY_PROJECT_ID,
    { fetchPolicy: 'network-only' },
  )
  const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE)
  const [refetchTaskByTaskId] = useLazyQuery(GET_TASK_BY_TASK_ID, {
    fetchPolicy: 'network-only',
  })
  const [refetchRunOn10] = useLazyQuery(GET_LABELING_FUNCTION_ON_10_RECORDS, {
    fetchPolicy: 'no-cache',
  })
  const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, {
    fetchPolicy: 'no-cache',
  })

  useEffect(() => {
    if (!projectId) return
    if (!router.query.heuristicId) return
    refetchLabelingTasksAndProcess()
  }, [projectId, router.query.heuristicId])

  useEffect(() => {
    if (!projectId) return
    if (!labelingTasks) return
    refetchCurrentHeuristicAndProcess()
  }, [labelingTasks])

  useEffect(() => {
    if (!currentHeuristic) return
    if (isInitialLf == null)
      setIsInitialLf(
        InformationSourceCodeLookup.isCodeStillTemplate(
          currentHeuristic.sourceCode,
        ) != null,
      )
    refetchTaskByTaskIdAndProcess()
  }, [currentHeuristic, isInitialLf])

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
    requests.push({
      commentType: CommentType.KNOWLEDGE_BASE,
      projectId: projectId,
    })
    requests.push({ commentType: CommentType.LABEL, projectId: projectId })
    CommentDataManager.unregisterCommentRequests(CurrentPage.LABELING_FUNCTION)
    CommentDataManager.registerCommentRequests(
      CurrentPage.LABELING_FUNCTION,
      requests,
    )
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
          postProcessCurrentHeuristic(
            res['data']['informationSourceBySourceId'],
            labelingTasks,
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

  function saveHeuristic(labelingTask: any) {
    const newCode = checkTemplateCodeChange(labelingTask)
    if (newCode) updateSourceCode(newCode, labelingTask.id)
    updateHeuristicMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        labelingTaskId: labelingTask.id,
      },
    }).then((res) => {
      dispatch(
        updateHeuristicsState(currentHeuristic.id, {
          labelingTaskId: labelingTask.id,
          labelingTaskName: labelingTask.name,
          labels: labelingTask.labels,
        }),
      )
    })
  }

  function updateSourceCodeToDisplay(value: string) {
    const finalSourceCode = value.replace(
      'def lf(record)',
      'def ' + currentHeuristic.name + '(record)',
    )
    dispatch(
      updateHeuristicsState(currentHeuristic.id, {
        sourceCodeToDisplay: finalSourceCode,
      }),
    )
  }

  function refetchTaskByTaskIdAndProcess() {
    if (currentHeuristic.lastTask == null) return
    if (currentHeuristic.lastTask.state == Status.QUEUED) {
      setLastTaskLogs(['Task is queued for execution'])
      return
    }
    refetchTaskByTaskId({
      variables: {
        projectId: projectId,
        payloadId: currentHeuristic.lastPayload.id,
      },
    }).then((res) => {
      setLastTaskLogs(
        postProcessLastTaskLogs(res['data']['payloadByPayloadId']),
      )
    })
  }

  function getLabelingFunctionOn10Records() {
    setDisplayLogWarning(true)
    setRunOn10IsRunning(true)
    refetchRunOn10({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
      },
    }).then((res) => {
      setRunOn10IsRunning(false)
      setSampleRecords(
        postProcessSampleRecords(
          res['data']['getLabelingFunctionOn10Records'],
          labelingTasks,
          currentHeuristic.labelingTaskId,
        ),
      )
      setLastTaskLogs(
        parseContainerLogsData(
          res['data']['getLabelingFunctionOn10Records']['containerLogs'],
        ),
      )
    })
  }

  function checkTemplateCodeChange(labelingTask) {
    if (!currentHeuristic) return
    const template: InformationSourceExamples =
      InformationSourceCodeLookup.isCodeStillTemplate(
        currentHeuristic.sourceCode,
      )
    if (template == null) return
    const matching = labelingTasks.filter((e) => e.id == labelingTask.id)
    const templateCode = getInformationSourceTemplate(
      matching,
      currentHeuristic.informationSourceType,
      null,
    ).code
    const currentHeuristicCopy = { ...currentHeuristic }
    const regMatch = getPythonFunctionRegExMatch(
      currentHeuristicCopy.sourceCode,
    )
    if (regMatch[2] !== currentHeuristicCopy.name) {
      currentHeuristicCopy.sourceCodeToDisplay = templateCode.replace(
        regMatch[2],
        currentHeuristicCopy.name,
      )
    }
    return currentHeuristicCopy.sourceCodeToDisplay
  }

  function updateSourceCode(value: string, labelingTaskId?: string) {
    var regMatch: any = getPythonFunctionRegExMatch(value)
    if (!regMatch) {
      console.log(
        "Can't find python function name -- seems wrong -- better dont save",
      )
      return
    }
    const finalSourceCode = value.replace(regMatch[0], 'def lf(record)')
    updateHeuristicMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        labelingTaskId: labelingTaskId ?? currentHeuristic.labelingTaskId,
        code: finalSourceCode,
        name: regMatch[2],
      },
    }).then((res) => {
      dispatch(
        updateHeuristicsState(currentHeuristic.id, {
          sourceCode: finalSourceCode,
          name: regMatch[2],
        }),
      )
      updateSourceCodeToDisplay(finalSourceCode)
    })
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
      } else if (
        [
          'information_source_updated',
          'model_callback_update_statistics',
        ].includes(msgParts[1])
      ) {
        if (currentHeuristic.id == msgParts[2]) {
          refetchCurrentHeuristicAndProcess()
        }
      } else if (msgParts[1] == 'payload_progress') {
        if (msgParts[2] != currentHeuristic.id) return
        dispatch(
          updateHeuristicsState(currentHeuristic.id, {
            lastTask: {
              progress: Number(msgParts[4]),
              state: Status.CREATED,
              iteration: currentHeuristic.lastPayload.iteration,
            },
          }),
        )
      } else {
        if (msgParts[2] != currentHeuristic.id) return
        refetchCurrentHeuristicAndProcess()
        if (
          msgParts[1] == 'payload_finished' ||
          msgParts[1] == 'payload_failed' ||
          msgParts[1] == 'payload_created'
        ) {
          refetchTaskByTaskIdAndProcess()
        }
      }
    },
    [currentHeuristic],
  )

  function setValueToLabelingTask(value: string) {
    const labelingTask = labelingTasks.find((a) => a.id == value)
    updateHeuristicMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        labelingTaskId: labelingTask.id,
      },
    }).then((res) => {
      dispatch(
        updateHeuristicsState(currentHeuristic.id, {
          labelingTaskId: labelingTask.id,
          labelingTaskName: labelingTask.name,
          labels: labelingTask.labels,
        }),
      )
    })
  }

  useWebsocket(
    CurrentPage.LABELING_FUNCTION,
    handleWebsocketNotification,
    projectId,
  )

  return (
    <HeuristicsLayout
      updateSourceCode={(code: string) => updateSourceCodeToDisplay(code)}
    >
      {currentHeuristic && (
        <div>
          <div className="relative flex min-h-16 flex-shrink-0 justify-between pb-2">
            <div className="mt-3 flex flex-wrap items-center">
              <div className="mr-2 inline-block text-sm font-medium leading-5 text-gray-700">
                Editor
              </div>
              <Tooltip
                content={TOOLTIPS_DICT.LABELING_FUNCTION.LABELING_TASK}
                color="invert"
                placement="top"
              >
                <Dropdown2
                  options={labelingTasks}
                  buttonName={currentHeuristic?.labelingTaskName}
                  selectedOption={(option: any) => saveHeuristic(option)}
                  dropdownClasses="z-30"
                />
              </Tooltip>
              {currentHeuristic.labels?.length == 0 ? (
                <div className="ml-3 text-sm font-normal text-gray-500">
                  No labels for target task
                </div>
              ) : (
                <>
                  {currentHeuristic.labels?.map((label: any, index: number) => (
                    <Tooltip
                      content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY}
                      color="invert"
                      placement="top"
                      key={label.name}
                    >
                      <span
                        onClick={() => copyToClipboard(label.name)}
                        className={`ml-3 inline-flex cursor-pointer items-center rounded border px-2 py-0.5 text-xs font-medium ${label.color.backgroundColor} ${label.color.hoverColor} ${label.color.textColor} ${label.color.borderColor}`}
                      >
                        {label.name}
                      </span>
                    </Tooltip>
                  ))}
                </>
              )}
            </div>
            <div className="flex flex-shrink-0 items-center justify-center">
              <div className="ml-auto flex flex-row flex-nowrap items-center">
                <BricksIntegrator
                  moduleTypeFilter={
                    currentHeuristic.labelingTaskType ==
                    'MULTICLASS_CLASSIFICATION'
                      ? 'classifier'
                      : 'extractor'
                  }
                  executionTypeFilter="pythonFunction,premium"
                  functionType="Heuristic"
                  labelingTaskId={currentHeuristic.labelingTaskId}
                  preparedCode={(code: string) => {
                    updateSourceCode(code)
                    setIsInitialLf(false)
                  }}
                  newTaskId={(value) => setValueToLabelingTask(value)}
                />

                <Tooltip
                  content={TOOLTIPS_DICT.LABELING_FUNCTION.INSTALLED_LIBRARIES}
                  color="invert"
                  placement="left"
                >
                  <a
                    href="https://github.com/code-kern-ai/refinery-lf-exec-env/blob/dev/requirements.txt"
                    target="_blank"
                    className="ml-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    See installed libraries
                  </a>
                </Tooltip>
              </div>
            </div>
          </div>
          <HeuristicsEditor
            isInitial={isInitialLf}
            updatedSourceCode={(code: string) => updateSourceCode(code)}
            setIsInitial={(val: boolean) => setIsInitialLf(val)}
            setCheckUnsavedChanges={(val: boolean) =>
              setCheckUnsavedChanges(val)
            }
          />

          <div className="float-right mt-2 flex flex-grow items-center justify-between">
            <div className="flex items-center">
              {runOn10IsRunning && (
                <div className="ml-2 flex items-center">
                  <LoadingIcon color="indigo" />
                </div>
              )}
              {checkUnsavedChanges && (
                <div className="ml-2 flex items-center">
                  <div className="text-sm font-normal">Saving...</div>
                  <LoadingIcon color="indigo" />
                </div>
              )}
              <div className="mr-2 flex items-center">
                <Dropdown2
                  options={attributes}
                  buttonName={
                    selectedAttribute
                      ? selectedAttribute.name
                      : 'Select display attribute'
                  }
                  buttonClasses="text-xs font-semibold actionsHeight"
                  selectedOption={(option: any) => setSelectedAttribute(option)}
                />
              </div>
              <Tooltip
                content={
                  selectedAttribute == null
                    ? TOOLTIPS_DICT.LABELING_FUNCTION.SELECT_ATTRIBUTE
                    : TOOLTIPS_DICT.LABELING_FUNCTION.RUN_ON_10
                }
                color="invert"
                placement="left"
              >
                <button
                  disabled={selectedAttribute == null}
                  onClick={getLabelingFunctionOn10Records}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Run on 10
                </button>
              </Tooltip>
              <HeuristicRunButtons
                updateDisplayLogWarning={(val) => setDisplayLogWarning(val)}
                runOn10IsRunning={runOn10IsRunning}
              />
            </div>
          </div>
          {sampleRecords &&
            sampleRecords.records.length > 0 &&
            !sampleRecords.codeHasErrors && (
              <>
                <SampleRecords
                  sampleRecords={sampleRecords}
                  selectedAttribute={selectedAttribute.name}
                />
                {displayLogWarning && (
                  <div className="inline-block text-sm font-normal italic text-gray-500">
                    This is a temporary log from your last &quot;Run on 10&quot;
                    execution. It will vanish once you leave/reload the page or
                    &quot;Run&quot; the heuristic.
                  </div>
                )}
              </>
            )}

          <ContainerLogs logs={lastTaskLogs} type="heuristic" />

          <CalculationProgress />

          <HeuristicStatistics />

          <DangerZone
            elementType={DangerZoneEnum.LABELING_FUNCTION}
            id={currentHeuristic.id}
            name={currentHeuristic.name}
          />
        </div>
      )}
    </HeuristicsLayout>
  )
}
