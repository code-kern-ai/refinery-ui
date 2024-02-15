import { selectLabelingTasksAll } from '@/src/reduxStore/states/pages/settings'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { ComponentType } from '@/src/types/components/projects/projectId/labeling/settings'
import { LabelingSuiteTaskHeaderDisplayData } from '@/src/types/components/projects/projectId/labeling/task-header'
import { LabelingTaskTaskType } from '@/src/types/components/projects/projectId/settings/labeling-tasks'
import {
  getHoverGroupsTaskOverview,
  setLabelsForDisplay,
} from '@/src/util/components/projects/projectId/labeling/task-header-helper'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import style from '@/src/styles/components/projects/projectId/labeling.module.css'
import { IconLayoutNavbarCollapse } from '@tabler/icons-react'
import QuickButtons from './QuickButtons'
import HeaderDisplay from './HeaderDisplay'
import {
  selectSettings,
  setSettings,
  updateSettings,
} from '@/src/reduxStore/states/pages/labeling'

export default function LabelingSuiteTaskHeader() {
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const labelingTasks = useSelector(selectLabelingTasksAll)
  const settings = useSelector(selectSettings)

  const [displayData, setDisplayData] =
    useState<LabelingSuiteTaskHeaderDisplayData[]>(null)

  useEffect(() => {
    if (!projectId) return
    if (!labelingTasks) return
    setDisplayData(prepareDataForDisplay(labelingTasks))
  }, [projectId, labelingTasks])

  function prepareDataForDisplay(data: any[]): any {
    if (!data) return null
    if (!settings) return null
    const finalData = Array(data.length)
    let i = 0
    const getSettings = localStorage.getItem('labelingSettings')
    const settingsCopy = getSettings
      ? JSON.parse(getSettings)
      : jsonCopy(settings)
    for (const task of data) {
      const taskCopy = jsonCopy(task)
      if (!settingsCopy.task[projectId]) settingsCopy.task[projectId] = {}
      let taskSettings = settingsCopy.task[projectId]
      if (!taskSettings) {
        taskSettings = {}
        settingsCopy.task[projectId][taskCopy.id] = taskSettings
      }
      taskCopy.labels.sort((a, b) => a.name.localeCompare(b.name))
      const labels = setLabelsForDisplay(taskCopy, taskSettings)
      let pos =
        task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? 0 : 10000
      pos += task.attribute ? task.attribute.relativePosition : 0
      finalData[i++] = {
        id: task.id,
        name: task.name,
        hoverGroups: getHoverGroupsTaskOverview(task.name),
        orderPos: pos,
        settings: taskSettings,
        labels: labels,
        labelOrder: task.labels.map((l) => l.id), //labels are sorted by name before
      }
      settingsCopy.task[projectId][taskCopy.id] = labels
    }
    const settingsCopy2 = getSettings
      ? JSON.parse(getSettings)
      : jsonCopy(settings)
    settingsCopy2.task[projectId] = settingsCopy.task[projectId]
    dispatch(setSettings(settingsCopy2))
    localStorage.setItem('labelingSettings', JSON.stringify(settingsCopy2))

    finalData.sort(
      (a, b) => a.orderPos - b.orderPos || a.name.localeCompare(b.name),
    )
    return finalData
  }

  function toggleIsCollapsed() {
    dispatch(updateSettings(ComponentType.TASK_HEADER, 'isCollapsed'))
    const getSettings = localStorage.getItem('labelingSettings')
    let settings = getSettings ? JSON.parse(getSettings) : {}
    settings.task.isCollapsed = !settings.task.isCollapsed
    localStorage.setItem('labelingSettings', JSON.stringify(settings))
  }

  return (
    <div id="base-dom-task-header" className="relative bg-white p-4">
      {displayData && displayData.length > 0 ? (
        <>
          <div
            className={`absolute right-4 top-4 cursor-pointer p-2 ${settings.task.isCollapsed ? style.rotateTransform : null}`}
            onClick={toggleIsCollapsed}
          >
            <IconLayoutNavbarCollapse size={24} stroke={2} />
          </div>
          {settings.task.isCollapsed ? (
            <div className="flex flex-row flex-wrap gap-x-2">
              <QuickButtons />
            </div>
          ) : (
            <HeaderDisplay displayData={displayData} />
          )}
        </>
      ) : (
        <p className="text-gray-500">No labeling tasks in project</p>
      )}
    </div>
  )
}
