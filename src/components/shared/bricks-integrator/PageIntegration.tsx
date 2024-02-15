import {
  selectBricksIntegrator,
  selectBricksIntegratorLabelingTasks,
  setBricksIntegrator,
} from '@/src/reduxStore/states/general'
import {
  IntegratorPage,
  PageIntegrationProps,
} from '@/src/types/shared/bricks-integrator'
import { BricksCodeParser } from '@/src/util/classes/bricks-integrator/bricks-integrator'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { Tooltip } from '@nextui-org/react'
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronsDown,
  IconInfoCircle,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import VariableSelect from './VariableSelect'
import {
  copyToClipboard,
  jsonCopy,
} from '@/submodules/javascript-functions/general'
import style from '@/src/styles/shared/bricks-integrator.module.css'
import { Fragment, useEffect } from 'react'
import { selectLabelingTasksAll } from '@/src/reduxStore/states/pages/settings'
import { CREATE_LABELS } from '@/src/services/gql/queries/project-setting'
import { useMutation } from '@apollo/client'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { CREATE_TASK_AND_LABELS } from '@/src/services/gql/mutations/project-settings'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'

export default function PageIntegration(props: PageIntegrationProps) {
  const dispatch = useDispatch()

  const config = useSelector(selectBricksIntegrator)
  const labelingTasks = useSelector(selectLabelingTasksAll)
  const projectId = useSelector(selectProjectId)
  const labelingTasksBricks = useSelector(selectBricksIntegratorLabelingTasks)

  const [createLabelsMut] = useMutation(CREATE_LABELS)
  const [createTaskAndLabelsMut] = useMutation(CREATE_TASK_AND_LABELS)

  useEffect(() => {
    if (
      !labelingTasksBricks ||
      labelingTasksBricks.length == 0 ||
      !props.labelingTaskId
    )
      return
    const configCopy = BricksCodeParser.checkVariableLines(
      jsonCopy(config),
      props.executionTypeFilter,
      props.labelingTaskId,
      props.forIde,
      labelingTasksBricks,
    )
    dispatch(setBricksIntegrator(configCopy))
  }, [labelingTasksBricks, props.labelingTaskId])

  function onInputFunctionName(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return
    let configCopy = { ...config }
    const start = event.target.selectionStart
    let value = event.target.value
    configCopy = BricksCodeParser.checkFunctionNameAndSet(
      value,
      configCopy,
      props.executionTypeFilter,
      props.nameLookups,
    )
    event.target.value = BricksCodeParser.functionName
    event.target.selectionStart = start
    event.target.selectionEnd = start
    props.checkCanAccept(configCopy)
  }

  function createNewLabelingTask(taskName: string, includedLabels: string[]) {
    if (!includedLabels.length) return
    const taskType = 'MULTICLASS_CLASSIFICATION' // currently only option since extraction would require a new attribute as well!!
    let finalTaskName = taskName

    let c = 0
    while (!!labelingTasks.find((lt) => lt.name == finalTaskName)) {
      finalTaskName = taskName + ' ' + ++c
    }
    createTaskAndLabelsMut({
      variables: {
        projectId: projectId,
        labelingTaskName: finalTaskName,
        labelingTaskType: taskType,
        labelingTaskTargetId: null,
        labels: includedLabels,
      },
    }).then((res) => {
      const taskId = res.data?.createTaskAndLabels?.taskId
      if (taskId) {
        props.selectDifferentTask(taskId)
      }
    })
  }

  function addMissingLabelsToTask() {
    if (!props.labelingTaskId) return
    const missing = BricksCodeParser.expected.expectedTaskLabels
      .filter((x) => !x.exists)
      .map((x) => x.label)
    createLabelsMut({
      variables: {
        projectId: projectId,
        labelingTaskId: props.labelingTaskId,
        labels: missing,
      },
    }).then((res) => {
      props.selectDifferentTask(props.labelingTaskId)
    })
  }

  return (
    <>
      {config && (
        <div
          className={`my-4 flex flex-col items-center justify-center gap-y-2 ${config.page != IntegratorPage.INTEGRATION ? 'hidden' : ''}`}
        >
          {BricksCodeParser?.errors.length > 0 && (
            <div className="relative flex flex-col rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              <div className="-mt-1 mb-1 flex flex-row flex-nowrap items-center self-center">
                <strong className="font-bold">Couldn&apos;t parse code</strong>
                <IconAlertTriangle className="ml-1 h-5 w-5 text-red-400" />
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
                {BricksCodeParser.errors.join('\n')}
              </pre>
            </div>
          )}
          {BricksCodeParser?.expected.expectedTaskLabels &&
            BricksCodeParser.expected.expectedTaskLabels.length > 0 && (
              <>
                {BricksCodeParser.expected.labelWarning ? (
                  <div className="relative flex flex-col gap-y-2 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
                    <div className="-mt-1 flex flex-row flex-nowrap items-center self-center">
                      <strong className="font-bold">Warning</strong>
                      <IconAlertTriangle className="ml-1 h-5 w-5 text-yellow-400" />
                    </div>
                    <label className="-mt-1 text-sm">
                      Your selected task doesn&apos;t have all necessary labels:
                    </label>
                    <div
                      className="flex flex-row flex-wrap gap-2"
                      style={{ maxWidth: '30rem' }}
                    >
                      {BricksCodeParser.expected.expectedTaskLabels.map(
                        (label, index) => (
                          <span
                            key={label.label}
                            className="inline-flex items-center text-sm"
                          >
                            <label
                              className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${label.backgroundColor} ${label.textColor} ${label.borderColor}`}
                            >
                              {label.label}
                              {label.exists ? (
                                <IconInfoCircle className="ml-1 h-4 w-4 text-green-400" />
                              ) : (
                                <IconX className="ml-1 h-4 w-4 text-gray-400" />
                              )}
                            </label>
                          </span>
                        ),
                      )}
                    </div>
                    <div className="flex flex-row justify-center gap-x-1">
                      <button
                        onClick={() => {
                          const configCopy =
                            BricksCodeParser.activeLabelMapping(
                              jsonCopy(config),
                              props.executionTypeFilter,
                              props.labelingTaskId,
                              props.forIde,
                              labelingTasks,
                            )
                          dispatch(setBricksIntegrator(configCopy))
                        }}
                        className="cursor-pointer whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Map labels
                      </button>
                      {BricksCodeParser.expected.canCreateTask && (
                        <button
                          onClick={() =>
                            createNewLabelingTask(
                              config.api.data.data.attributes.name,
                              BricksCodeParser.expected.expectedTaskLabels.map(
                                (x) => x.label,
                              ),
                            )
                          }
                          className="cursor-pointer whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                          Create new task
                        </button>
                      )}
                      <button
                        onClick={addMissingLabelsToTask}
                        className="cursor-pointer whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Add missing labels (
                        {BricksCodeParser.expected.labelsToBeCreated}x)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex w-4/5 flex-col gap-y-2 rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700">
                    <div className="-mt-1 flex flex-row flex-nowrap items-center self-center">
                      <strong className="font-bold">Information</strong>
                      <IconInfoCircle className="ml-1 h-5 w-5 text-blue-400" />
                    </div>
                    <label className="-mt-1 text-sm">
                      All necessary labels found in task:
                    </label>
                    <div
                      className="flex flex-row flex-wrap gap-2"
                      style={{ maxWidth: '30rem' }}
                    >
                      {BricksCodeParser.expected.expectedTaskLabels.map(
                        (label: any, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center text-sm"
                          >
                            <label
                              className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${label.backgroundColor} ${label.textColor} ${label.borderColor}`}
                            >
                              {label.label}
                              <IconCheck className="ml-1 h-4 w-4 text-green-400" />
                            </label>
                          </span>
                        ),
                      )}
                    </div>
                    <div className="flex flex-row justify-center gap-x-1">
                      <button
                        onClick={() => {
                          const configCopy =
                            BricksCodeParser.activeLabelMapping(
                              jsonCopy(config),
                              props.executionTypeFilter,
                              props.labelingTaskId,
                              props.forIde,
                              labelingTasks,
                            )
                          dispatch(setBricksIntegrator(configCopy))
                        }}
                        className="cursor-pointer whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Map labels anyway
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          {BricksCodeParser.globalComments &&
            BricksCodeParser.globalComments.length > 0 && (
              <div className="relative flex flex-col rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700">
                <div className="-mt-1 mb-1 flex flex-row flex-nowrap items-center self-center">
                  <strong className="font-bold">Information</strong>
                  <IconInfoCircle className="ml-1 h-5 w-5 text-blue-400" />
                </div>
                <div className="flex flex-col" style={{ maxWidth: '30rem' }}>
                  {BricksCodeParser.globalComments.map((cLine, index) => (
                    <span key={cLine} className="text-sm">
                      {cLine}
                    </span>
                  ))}
                </div>
              </div>
            )}
          {BricksCodeParser?.variables.length == 0 ? (
            <label>Nothing to parse, code can be used without changes</label>
          ) : (
            <div
              className="grid grid-cols-3 items-center gap-x-2 gap-y-2 px-4 pb-4 text-left"
              style={{
                gridTemplateColumns: 'max-content max-content max-content',
              }}
            >
              <label className="col-start-1 font-bold">
                {props.functionType} name
              </label>
              <div className="contents">
                <input
                  className="placeholder-italic h-9 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                  type="text"
                  value={BricksCodeParser.functionName}
                  onChange={(e: any) => onInputFunctionName(e)}
                />
              </div>
              <div className="col-span-1 inline-flex">
                {BricksCodeParser.nameTaken && (
                  <Tooltip
                    content={BricksCodeParser.functionName + ' name exists'}
                    color="invert"
                    placement="top"
                    className="cursor-auto"
                  >
                    <IconAlertTriangle
                      className="h-6 w-6 text-red-700"
                      stroke={1.5}
                    />
                  </Tooltip>
                )}
              </div>
              {BricksCodeParser.labelingTaskName && (
                <Fragment>
                  <label className="col-start-1 font-bold">Labeling Task</label>
                  <Dropdown2
                    options={labelingTasks}
                    buttonName={BricksCodeParser.labelingTaskName}
                    selectedOption={(option: any) => {
                      BricksCodeParser.labelingTaskName = option.name
                      props.selectDifferentTask(option.id)
                    }}
                  />
                  <Tooltip
                    content={TOOLTIPS_DICT.HEURISTICS.SWITCH_LABELING_TASK}
                    color="invert"
                    placement="top"
                    className="cursor-auto"
                  >
                    <IconAlertTriangle
                      className="h-6 w-6 text-yellow-700"
                      stroke={1.5}
                    />
                  </Tooltip>
                </Fragment>
              )}

              <label className="font-bold">Variable</label>
              <label className="font-bold">Value</label>
              <label></label>
              {BricksCodeParser.variables.map((v, index) => (
                <Fragment key={v.baseName}>
                  <div>
                    <Tooltip
                      content={v.optional ? TOOLTIPS_DICT.GENERAL.OPTIONAL : ''}
                      color="invert"
                      placement="left"
                      className="cursor-auto"
                    >
                      <label
                        className={`col-start-1 text-sm ${v.optional ? 'text-left text-gray-400' : ''}`}
                      >
                        {v.displayName}
                        {!v.optional && <span>*</span>}
                      </label>
                    </Tooltip>
                  </div>
                  <div>
                    <VariableSelect
                      variable={v}
                      index={index}
                      sendOption={() => {
                        const configCopy = BricksCodeParser.replaceVariables(
                          jsonCopy(config),
                          props.executionTypeFilter,
                          null,
                          props.forIde,
                        )
                        dispatch(setBricksIntegrator(configCopy))
                      }}
                      labelingTaskId={props.labelingTaskId}
                    />
                  </div>
                  <div>
                    {v.comment && (
                      <Tooltip
                        content={v.comment}
                        color="invert"
                        placement="top"
                        className="cursor-auto"
                      >
                        <IconInfoCircle className="h-6 w-6 " stroke={2} />
                      </Tooltip>
                    )}
                  </div>
                </Fragment>
              ))}
              {BricksCodeParser.expected.labelMappingActive && (
                <Fragment>
                  <label className="col-start-1 font-bold">Bricks label</label>
                  <label className="font-bold">Refinery label</label>
                  {BricksCodeParser.expected.expectedTaskLabels.map(
                    (l, index) => (
                      <div key={l.label} className="contents">
                        <label className="col-start-1 text-sm">{l.label}</label>
                        <Dropdown2
                          options={BricksCodeParser.expected.availableLabels}
                          buttonName={l.mappedLabel ? l.mappedLabel : 'Ignore'}
                          selectedOption={(option: any) => {
                            BricksCodeParser.expected.expectedTaskLabels[
                              index
                            ].mappedLabel = option.name
                            const configCopy =
                              BricksCodeParser.replaceVariables(
                                jsonCopy(config),
                                props.executionTypeFilter,
                                null,
                                props.forIde,
                              )
                            dispatch(setBricksIntegrator(configCopy))
                          }}
                        />
                        {BricksCodeParser.expected.expectedTaskLabels[index]
                          .mappedLabel && (
                          <Tooltip content={TOOLTIPS_DICT.GENERAL.CLEAR}>
                            <IconTrash
                              strokeWidth={1.5}
                              onClick={() => {
                                BricksCodeParser.expected.expectedTaskLabels[
                                  index
                                ].mappedLabel = null
                                const configCopy =
                                  BricksCodeParser.replaceVariables(
                                    jsonCopy(config),
                                    props.executionTypeFilter,
                                    null,
                                    props.forIde,
                                  )
                                dispatch(setBricksIntegrator(configCopy))
                              }}
                            />
                          </Tooltip>
                        )}
                      </div>
                    ),
                  )}
                </Fragment>
              )}
            </div>
          )}
          <div className="w-full">
            <div
              className="flex cursor-pointer flex-row items-center justify-between"
              onClick={() => {
                const configCopy = { ...config }
                configCopy.integratorCodeOpen = !configCopy.integratorCodeOpen
                dispatch(setBricksIntegrator(configCopy))
              }}
            >
              <label className="cursor-pointer text-base font-bold text-gray-900 underline">
                Final Code
              </label>
              <IconChevronsDown
                className={`h-6 w-6 ${config.integratorCodeOpen ? style.rotateTransform : null}`}
              />
            </div>
            <div
              className={`mt-1 flex flex-col items-center ${config.integratorCodeOpen ? '' : 'hidden'}`}
            >
              <div
                className="w-full overflow-y-auto"
                style={{ maxHeight: '15rem' }}
              >
                <pre
                  className={`${style.editorPre}`}
                  style={{
                    overflowX: config.integratorCodeOpen ? 'auto' : 'hidden',
                  }}
                >
                  {config.preparedCode}
                </pre>
              </div>
            </div>
          </div>
          {config.api.moduleId == -2 && (
            <div className="w-full">
              <div
                className="flex cursor-pointer flex-row items-center justify-between"
                onClick={() => {
                  const configCopy = BricksCodeParser.replaceVariables(
                    jsonCopy(config),
                    props.executionTypeFilter,
                    null,
                    props.forIde,
                  )
                  configCopy.integratorParseOpen =
                    !configCopy.integratorParseOpen
                  dispatch(setBricksIntegrator(configCopy))
                }}
              >
                <label className="cursor-pointer text-base font-bold text-gray-900">
                  Final Json
                </label>
                <IconChevronsDown
                  className={`h-6 w-6 ${config.integratorParseOpen ? style.rotateTransform : null}`}
                />
              </div>
              <div
                className={`mt-1 flex flex-col items-center ${config.integratorParseOpen ? '' : 'hidden'}`}
              >
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: '15rem', maxWidth: '35rem' }}
                >
                  <pre
                    className={`${style.editorPre}`}
                    style={{
                      overflowX: config.overviewCodeOpen ? 'auto' : 'hidden',
                    }}
                  >
                    {config.preparedJson}
                  </pre>
                </div>
                <div className="flex flex-row flex-wrap gap-2">
                  <div
                    className="flex cursor-pointer flex-row flex-nowrap"
                    onClick={() => {
                      const configCopy = BricksCodeParser.replaceVariables(
                        jsonCopy(config),
                        props.executionTypeFilter,
                        null,
                        props.forIde,
                      )
                      configCopy.prepareJsonAsPythonEnum =
                        !configCopy.prepareJsonAsPythonEnum
                      dispatch(setBricksIntegrator(configCopy))
                    }}
                  >
                    <input
                      className="h-5 w-5 cursor-pointer"
                      type="checkbox"
                      checked={config.prepareJsonAsPythonEnum}
                      onChange={() => {}}
                    />
                    <label className="ml-1 text-sm">Prepare as enum</label>
                  </div>
                  <div
                    className="flex cursor-pointer flex-row flex-nowrap"
                    onClick={() => {
                      const configCopy = BricksCodeParser.replaceVariables(
                        jsonCopy(config),
                        props.executionTypeFilter,
                        null,
                        props.forIde,
                      )
                      configCopy.prepareJsonRemoveYOUR =
                        !configCopy.prepareJsonRemoveYOUR
                      dispatch(setBricksIntegrator(configCopy))
                    }}
                  >
                    <input
                      className="h-5 w-5 cursor-pointer"
                      type="checkbox"
                      checked={config.prepareJsonRemoveYOUR}
                      onChange={() => {}}
                    />
                    <label className="ml-1 text-sm">Remove YOUR_</label>
                  </div>
                </div>
                <Tooltip
                  content={
                    config.copied
                      ? TOOLTIPS_DICT.GENERAL.COPIED
                      : TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY
                  }
                  color="invert"
                  placement="top"
                  className="mt-2"
                >
                  <button
                    type="button"
                    onClick={() => copyToClipboard(config.preparedJson)}
                    className="rounded-md border bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none"
                  >
                    Copy
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
