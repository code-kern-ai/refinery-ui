import { openModal, setModalStates } from '@/src/reduxStore/states/modal'
import {
  selectLabelingTasksAll,
  setLabelingTasksAll,
} from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import {
  LabelType,
  LabelingTask,
  LabelingTaskTaskType,
} from '@/src/types/components/projects/projectId/settings/labeling-tasks'
import { ModalEnum } from '@/src/types/shared/modal'
import { LabelHelper } from '@/src/util/classes/label-helper'
import {
  isTaskNameUnique,
  labelingTaskFromString,
  labelingTaskToString,
} from '@/src/util/components/projects/projectId/settings/labeling-tasks-helper'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import { useMutation } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { IconColorPicker, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RenameLabelModal from './RenameLabelModal'
import { UPDATE_LABELING_TASK } from '@/src/services/gql/mutations/project-settings'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import AddLabelingTaskModal from './AddLabelingTaskModal'
import DeleteLabelingTaskModal from './DeleteLabelingTaskModal'
import DeleteLabelModal from './DeleteLabelModal'
import AddLabelModal from './AddLabelModal'
import ChangeColorModal from './ChangeColorModal'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'

export default function LabelingTasks() {
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const labelingTasksSchema = useSelector(selectLabelingTasksAll)

  const [labelingTasksDropdownArray, setLabelingTasksDropdownArray] = useState<
    { name: string; value: string }[]
  >([])

  const [updateLabelingTaskMut] = useMutation(UPDATE_LABELING_TASK)

  useEffect(() => {
    LabelHelper.setLabelColorOptions()
  }, [projectId])

  useEffect(() => {
    setLabelingTasksDropdownArray(labelingTasksDropdownValues())
  }, [labelingTasksSchema])

  function openTaskName(index: number) {
    const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema)
    labelingTasksSchemaCopy[index].nameOpen = true
    dispatch(setLabelingTasksAll(labelingTasksSchemaCopy))
  }

  function changeTaskName(task: LabelingTask, index: number, value: string) {
    const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema)
    labelingTasksSchemaCopy[index].nameOpen = false
    dispatch(setLabelingTasksAll(labelingTasksSchemaCopy))
    if (value == '') return
    if (!isTaskNameUnique(labelingTasksSchema, value)) return
    updateLabelingTaskMut({
      variables: {
        projectId: projectId,
        labelingTaskId: task.id,
        labelingTaskName: value,
        labelingTaskType: task.taskType,
        labelingTaskTargetId: task.targetId == '' ? null : task.targetId,
      },
    }).then((res) => {
      const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema)
      labelingTasksSchemaCopy[index].name = value
      labelingTasksSchemaCopy[index].nameOpen = false
      dispatch(setLabelingTasksAll(labelingTasksSchemaCopy))
    })
  }

  function updateLabelingTaskType(
    task: LabelingTask,
    index: number,
    value: string,
  ) {
    updateLabelingTaskMut({
      variables: {
        projectId: projectId,
        labelingTaskId: task.id,
        labelingTaskName: task.name,
        labelingTaskType: value,
        labelingTaskTargetId: task.targetId == '' ? null : task.targetId,
      },
    }).then((res) => {
      const labelingTasksSchemaCopy = jsonCopy(labelingTasksSchema)
      labelingTasksSchemaCopy[index].taskType = value
      dispatch(setLabelingTasksAll(labelingTasksSchemaCopy))
    })
  }

  function labelingTasksDropdownValues() {
    const prepareNewArray: { name: string; value: string }[] = []
    for (let t of Object.values(LabelingTaskTaskType)) {
      if (t == LabelingTaskTaskType.NOT_USEABLE) continue
      prepareNewArray.push({
        name: labelingTaskToString(t),
        value: t,
      })
    }
    return prepareNewArray
  }

  return (
    <div className="mt-8">
      <div className="inline-block text-lg font-medium leading-6 text-gray-900">
        Labeling tasks
      </div>
      <div className="mt-1">
        <div className="inline-block text-sm font-medium leading-5 text-gray-700">
          Define what kind of things you want to label. We currently support
          classifications and extractions.
        </div>

        <div className="inline-block min-w-full align-middle">
          <div
            className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            style={{ padding: '3px' }}
          >
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Target
                  </th>
                  <th
                    scope="col"
                    className="w-60 px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Task Type
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Labels
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                  ></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {labelingTasksSchema &&
                  labelingTasksSchema.map(
                    (task: LabelingTask, index: number) => (
                      <tr
                        key={task.id}
                        className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          {task.targetName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          {!task.nameOpen ? (
                            <p
                              className="cursor-pointer break-words"
                              onClick={() => openTaskName(index)}
                            >
                              {task.name}
                            </p>
                          ) : (
                            <input
                              type="text"
                              defaultValue={task.name}
                              onKeyDown={(event) => {
                                if (event.key == 'Enter')
                                  changeTaskName(
                                    task,
                                    index,
                                    event.currentTarget.value,
                                  )
                              }}
                              onBlur={(event) =>
                                changeTaskName(
                                  task,
                                  index,
                                  event.currentTarget.value,
                                )
                              }
                              autoFocus={true}
                              className="placeholder-italic h-8 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                            />
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          <Dropdown2
                            options={labelingTasksDropdownArray}
                            buttonName={labelingTaskToString(task.taskType)}
                            disabledOptions={[
                              false,
                              task.targetName === 'Full Record',
                              false,
                            ]}
                            dropdownWidth="w-60"
                            dropdownItemsClasses="w-60"
                            selectedOption={(option: any) =>
                              updateLabelingTaskType(
                                task,
                                index,
                                labelingTaskFromString(option.name),
                              )
                            }
                          />
                        </td>
                        <td className="flex flex-wrap items-center justify-center px-3 py-2 text-sm text-gray-500">
                          {task.labels.map((label: LabelType) => (
                            <div
                              key={label.id}
                              className={`m-1 inline-flex items-center rounded-md border px-1.5 py-0.5 text-sm font-medium ${label.color.backgroundColor} ${label.color.textColor} ${label.color.borderColor} ${label.color.hoverColor}`}
                            >
                              <IconColorPicker
                                className="mr-1 h-4 w-4 cursor-pointer"
                                onClick={() =>
                                  dispatch(
                                    setModalStates(ModalEnum.CHANGE_COLOR, {
                                      taskId: task.id,
                                      label: label,
                                      open: true,
                                    }),
                                  )
                                }
                              />
                              <span>{label.name}</span>
                              {label.hotkey && (
                                <kbd className="ml-2 inline-flex items-center rounded border border-gray-200 bg-white px-2 font-sans text-sm font-medium uppercase text-gray-400">
                                  {label.hotkey}
                                </kbd>
                              )}
                              <IconTrash
                                className="ml-1 h-4 w-4 cursor-pointer"
                                onClick={() =>
                                  dispatch(
                                    setModalStates(ModalEnum.DELETE_LABEL, {
                                      taskId: task.id,
                                      label: label,
                                      open: true,
                                    }),
                                  )
                                }
                              />
                            </div>
                          ))}
                          <button
                            disabled={
                              task.taskType == LabelingTaskTaskType.NOT_SET
                            }
                            className="cursor-pointer rounded-md bg-gray-100 p-1 text-gray-800 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <IconPlus
                              className={`${task.taskType == LabelingTaskTaskType.NOT_SET ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              onClick={() =>
                                dispatch(
                                  setModalStates(ModalEnum.ADD_LABEL, {
                                    taskId: task.id,
                                    open: true,
                                  }),
                                )
                              }
                            />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                          <IconTrash
                            onClick={() =>
                              dispatch(
                                setModalStates(ModalEnum.DELETE_LABELING_TASK, {
                                  taskId: task.id,
                                  open: true,
                                }),
                              )
                            }
                            className="h-6 w-6 cursor-pointer text-red-700"
                          />
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1">
        <Tooltip
          content={
            TOOLTIPS_DICT.PROJECT_SETTINGS.LABELING_TASK.NEW_LABELING_TASK
          }
          color="invert"
          placement="right"
        >
          <button
            onClick={() => dispatch(openModal(ModalEnum.ADD_LABELING_TASK))}
            className="inline-block cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            <IconPlus className="mr-1 inline-block h-5 w-5" />
            Add labeling task
          </button>
        </Tooltip>
      </div>

      <AddLabelingTaskModal />
      <DeleteLabelingTaskModal />
      <DeleteLabelModal />
      <AddLabelModal />
      <ChangeColorModal />
      <RenameLabelModal />
    </div>
  )
}
