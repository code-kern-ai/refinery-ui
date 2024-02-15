import { useDispatch, useSelector } from 'react-redux'
import HeuristicsLayout from '../shared/HeuristicsLayout'
import { useRouter } from 'next/router'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
  GET_HEURISTICS_BY_ID,
  GET_TASK_BY_TASK_ID,
} from '@/src/services/gql/queries/heuristics'
import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  selectHeuristic,
  setActiveHeuristics,
  updateHeuristicsState,
} from '@/src/reduxStore/states/pages/heuristics'
import {
  getClassLine,
  postProcessCurrentHeuristic,
  postProcessLastTaskLogs,
} from '@/src/util/components/projects/projectId/heuristics/heuristicId/heuristics-details-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import {
  selectEmbeddings,
  selectEmbeddingsFiltered,
  selectLabelingTasksAll,
  selectVisibleAttributesHeuristics,
  setAllEmbeddings,
  setFilteredEmbeddings,
  setLabelingTasksAll,
} from '@/src/reduxStore/states/pages/settings'
import { UPDATE_INFORMATION_SOURCE } from '@/src/services/gql/mutations/heuristics'
import {
  postProcessLabelingTasks,
  postProcessLabelingTasksSchema,
} from '@/src/util/components/projects/projectId/settings/labeling-tasks-helper'
import {
  GET_EMBEDDING_SCHEMA_BY_PROJECT_ID,
  GET_LABELING_TASKS_BY_PROJECT_ID,
} from '@/src/services/gql/queries/project-setting'
import { postProcessingEmbeddings } from '@/src/util/components/projects/projectId/settings/embeddings-helper'
import { embeddingRelevant } from '@/src/util/components/projects/projectId/heuristics/heuristicId/labeling-functions-helper'
import { Embedding } from '@/src/types/components/projects/projectId/settings/embeddings'
import { Status } from '@/src/types/shared/statuses'
import { copyToClipboard } from '@/submodules/javascript-functions/general'
import HeuristicsEditor from '../shared/HeuristicsEditor'
import HeuristicRunButtons from '../shared/HeuristicRunButtons'
import ContainerLogs from '@/src/components/shared/logs/ContainerLogs'
import HeuristicStatistics from '../shared/HeuristicStatistics'
import DangerZone from '@/src/components/shared/danger-zone/DangerZone'
import { DangerZoneEnum } from '@/src/types/shared/danger-zone'
import {
  getPythonClassName,
  getPythonClassRegExMatch,
} from '@/submodules/javascript-functions/python-functions-parser'
import { CurrentPage } from '@/src/types/shared/general'
import {
  selectAllUsers,
  setBricksIntegrator,
  setLabelsBricksIntegrator,
  setComments,
} from '@/src/reduxStore/states/general'
import { CommentType } from '@/src/types/shared/comments'
import { CommentDataManager } from '@/src/util/classes/comments'
import { REQUEST_COMMENTS } from '@/src/services/gql/queries/projects'
import BricksIntegrator from '@/src/components/shared/bricks-integrator/BricksIntegrator'
import {
  InformationSourceCodeLookup,
  InformationSourceExamples,
} from '@/src/util/classes/heuristics'
import { getInformationSourceTemplate } from '@/src/util/components/projects/projectId/heuristics/heuristics-helper'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket'
import { BricksCodeParser } from '@/src/util/classes/bricks-integrator/bricks-integrator'

export default function ActiveLearning() {
  const dispatch = useDispatch()
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const currentHeuristic = useSelector(selectHeuristic)
  const labelingTasks = useSelector(selectLabelingTasksAll)
  const embeddings = useSelector(selectEmbeddings)
  const embeddingsFiltered = useSelector(selectEmbeddingsFiltered)
  const attributes = useSelector(selectVisibleAttributesHeuristics)
  const allUsers = useSelector(selectAllUsers)

  const [lastTaskLogs, setLastTaskLogs] = useState<string[]>([])
  const [isInitialAL, setIsInitialAL] = useState<boolean>(null) //null as add state to differentiate between initial, not and unchecked
  const [checkUnsavedChanges, setCheckUnsavedChanges] = useState(false)

  const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID, {
    fetchPolicy: 'network-only',
  })
  const [refetchLabelingTasksByProjectId] = useLazyQuery(
    GET_LABELING_TASKS_BY_PROJECT_ID,
    { fetchPolicy: 'network-only' },
  )
  const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE)
  const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, {
    fetchPolicy: 'network-only',
  })
  const [refetchTaskByTaskId] = useLazyQuery(GET_TASK_BY_TASK_ID, {
    fetchPolicy: 'no-cache',
  })
  const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, {
    fetchPolicy: 'no-cache',
  })

  useEffect(() => {
    if (!projectId) return
    if (!router.query.heuristicId) return
    refetchLabelingTasksAndProcess()
    refetchEmbeddingsAndPostProcess()
  }, [projectId, router.query.heuristicId])

  useEffect(() => {
    if (!projectId) return
    if (!labelingTasks) return
    refetchCurrentHeuristicAndProcess()
  }, [labelingTasks])

  useEffect(() => {
    if (!currentHeuristic) return
    if (!embeddings) return
    dispatch(
      setFilteredEmbeddings(
        embeddings.filter((e) =>
          embeddingRelevant(
            e,
            attributes,
            labelingTasks,
            currentHeuristic.labelingTaskId,
          ),
        ),
      ),
    )
    refetchTaskByTaskIdAndProcess()
    if (isInitialAL == null)
      setIsInitialAL(
        InformationSourceCodeLookup.isCodeStillTemplate(
          currentHeuristic.sourceCode.replace(
            embeddingsFiltered[0]?.name,
            '@@EMBEDDING@@',
          ),
        ) != null,
      )
  }, [currentHeuristic])

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
    requests.push({ commentType: CommentType.EMBEDDING, projectId: projectId })
    requests.push({ commentType: CommentType.LABEL, projectId: projectId })
    CommentDataManager.unregisterCommentRequests(CurrentPage.ACTIVE_LEARNING)
    CommentDataManager.registerCommentRequests(
      CurrentPage.ACTIVE_LEARNING,
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

  function refetchTaskByTaskIdAndProcess() {
    if (currentHeuristic.lastTask == null) return
    if (currentHeuristic.lastTask.state == Status.QUEUED) {
      setLastTaskLogs(['Task is queued for execution'])
      return
    }
    refetchTaskByTaskId({
      variables: {
        projectId: projectId,
        payloadId: currentHeuristic.lastTask.id,
      },
    }).then((res) => {
      setLastTaskLogs(
        postProcessLastTaskLogs(res['data']['payloadByPayloadId']),
      )
    })
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

  function refetchEmbeddingsAndPostProcess() {
    refetchEmbeddings({ variables: { projectId: projectId } }).then((res) => {
      const embeddings = postProcessingEmbeddings(
        res.data['projectByProjectId']['embeddings']['edges'].map(
          (e) => e['node'],
        ),
        [],
      )
      dispatch(setAllEmbeddings(embeddings))
    })
  }

  function checkTemplateCodeChange(labelingTask) {
    if (!currentHeuristic) return
    const template: InformationSourceExamples =
      InformationSourceCodeLookup.isCodeStillTemplate(
        currentHeuristic.sourceCode.replace(
          embeddingsFiltered[0]?.name,
          '@@EMBEDDING@@',
        ),
      )
    if (template == null) return
    const matching = labelingTasks.filter((e) => e.id == labelingTask.id)
    const newEmbeddings = embeddings.filter((e) =>
      embeddingRelevant(e, attributes, labelingTasks, labelingTask.id),
    )
    if (newEmbeddings.length == 0) {
      alert('No embeddings found for labeling task')
    } else if (newEmbeddings.length > 1) {
      alert(
        'Multiple embeddings found for labeling task, the first one will be used',
      )
    }
    const templateCode = getInformationSourceTemplate(
      matching,
      currentHeuristic.informationSourceType,
      newEmbeddings[0]?.name,
    ).code
    const currentHeuristicCopy = { ...currentHeuristic }
    currentHeuristicCopy.sourceCodeToDisplay = templateCode.replace(
      getPythonClassName(templateCode),
      currentHeuristicCopy.name,
    )
    return currentHeuristicCopy.sourceCodeToDisplay
  }

  function updateSourceCodeToDisplay(value: string) {
    const finalSourceCode = value.replace(
      getClassLine(null, labelingTasks, currentHeuristic.labelingTaskId),
      getClassLine(
        currentHeuristic.name,
        labelingTasks,
        currentHeuristic.labelingTaskId,
      ),
    )
    dispatch(
      updateHeuristicsState(currentHeuristic.id, {
        sourceCodeToDisplay: finalSourceCode,
      }),
    )
  }

  function updateSourceCode(value: string, labelingTaskId?: string) {
    var regMatch: any = getPythonClassRegExMatch(value)
    if (!regMatch) {
      console.log(
        "Can't find python function name -- seems wrong -- better dont save",
      )
      return
    }
    const labelingTaskFinalId =
      labelingTaskId ?? currentHeuristic.labelingTaskId
    const finalSourceCode = value.replace(
      regMatch[0],
      getClassLine(null, labelingTasks, labelingTaskFinalId),
    )
    updateHeuristicMut({
      variables: {
        projectId: projectId,
        informationSourceId: currentHeuristic.id,
        labelingTaskId: labelingTaskFinalId,
        code: finalSourceCode,
        name: regMatch[1],
      },
    }).then((res) => {
      dispatch(
        updateHeuristicsState(currentHeuristic.id, {
          sourceCode: finalSourceCode,
          name: regMatch[1],
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
      } else if (
        msgParts[1] == 'embedding_deleted' ||
        (msgParts[1] == 'embedding' && msgParts[3] == 'state')
      ) {
        refetchEmbeddingsAndPostProcess()
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
    CurrentPage.ACTIVE_LEARNING,
    handleWebsocketNotification,
    projectId,
  )

  return (
    <HeuristicsLayout
      updateSourceCode={(code) => updateSourceCodeToDisplay(code)}
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
                      onClick={() => copyToClipboard(label.name)}
                    >
                      <span
                        className={`ml-3 inline-flex cursor-pointer items-center rounded border px-2 py-0.5 text-xs font-medium ${label.color.backgroundColor} ${label.color.hoverColor} ${label.color.textColor} ${label.color.borderColor}`}
                      >
                        {label.name}
                      </span>
                    </Tooltip>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="mb-3 flex flex-row items-center">
            <div className="flex items-center">
              {embeddings.length > 0 ? (
                <>
                  {embeddingsFiltered.length > 0 ? (
                    <>
                      <div className="mr-2 inline-block text-sm font-medium leading-5 text-gray-700">
                        Embeddings
                      </div>
                      {embeddingsFiltered.map(
                        (embedding: Embedding, index: number) => (
                          <Fragment key={embedding.id}>
                            {embedding.state == Status.FINISHED && (
                              <Tooltip
                                content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY}
                                color="invert"
                                placement="top"
                              >
                                <span
                                  className="inline-flex cursor-pointer items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
                                  onClick={() =>
                                    copyToClipboard(embedding.name)
                                  }
                                >
                                  {embedding.name}
                                </span>
                              </Tooltip>
                            )}
                            {embedding.state == Status.FAILED && (
                              <Tooltip
                                content={
                                  TOOLTIPS_DICT.LABELING_FUNCTION
                                    .CLICK_TO_COPY_ERROR
                                }
                                color="invert"
                                placement="top"
                              >
                                <span
                                  className="inline-flex cursor-pointer items-center rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                                  onClick={() =>
                                    copyToClipboard(embedding.name)
                                  }
                                >
                                  {embedding.name}
                                </span>
                              </Tooltip>
                            )}
                            {embedding.state != Status.FINISHED &&
                              embedding.state != Status.FAILED && (
                                <Tooltip
                                  content={
                                    TOOLTIPS_DICT.LABELING_FUNCTION
                                      .CLICK_TO_COPY_ERROR
                                  }
                                  color="invert"
                                  placement="top"
                                >
                                  <span
                                    className="inline-flex cursor-pointer items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                                    onClick={() =>
                                      copyToClipboard(embedding.name)
                                    }
                                  >
                                    {embedding.name}
                                  </span>
                                </Tooltip>
                              )}
                          </Fragment>
                        ),
                      )}
                    </>
                  ) : (
                    <div className="text-sm font-normal text-gray-500">
                      No matching embeddings found
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm font-normal text-gray-500">
                  No embeddings for project
                </div>
              )}
            </div>
            <div className="ml-auto flex flex-row flex-nowrap items-center">
              <BricksIntegrator
                moduleTypeFilter={
                  currentHeuristic.labelingTaskType ==
                  'MULTICLASS_CLASSIFICATION'
                    ? 'classifier'
                    : 'extractor'
                }
                executionTypeFilter="activeLearner"
                functionType="Heuristic"
                labelingTaskId={currentHeuristic.labelingTaskId}
                preparedCode={(code: string) => {
                  updateSourceCode(code)
                  setIsInitialAL(false)
                }}
                newTaskId={(value) => setValueToLabelingTask(value)}
              />
            </div>
          </div>
          <HeuristicsEditor
            isInitial={isInitialAL}
            updatedSourceCode={(code: string) => updateSourceCode(code)}
            setIsInitial={(val) => setIsInitialAL(val)}
            setCheckUnsavedChanges={(val) => setCheckUnsavedChanges(val)}
          />

          <div className="float-right mt-2 flex flex-grow items-center justify-between">
            <div className="flex items-center">
              {checkUnsavedChanges && (
                <div className="ml-2 flex items-center">
                  <div className="text-sm font-normal">Saving...</div>
                  <LoadingIcon color="indigo" />
                </div>
              )}
              <HeuristicRunButtons />
            </div>
          </div>

          <ContainerLogs logs={lastTaskLogs} type="heuristic" />

          <HeuristicStatistics />

          <DangerZone
            elementType={DangerZoneEnum.ACTIVE_LEARNING}
            id={currentHeuristic.id}
            name={currentHeuristic.name}
          />
        </div>
      )}
    </HeuristicsLayout>
  )
}
