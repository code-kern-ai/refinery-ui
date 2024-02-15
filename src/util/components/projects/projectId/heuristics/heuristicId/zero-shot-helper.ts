import {
  InformationSourceType,
  LabelSource,
} from '@/submodules/javascript-functions/enums/enums'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import { getColorStruct, mapInformationSourceStats } from '../shared-helper'
import {
  dateAsUTCDate,
  timeDiffCalc,
} from '@/submodules/javascript-functions/date-parser'
import { Heuristic } from '@/src/types/components/projects/projectId/heuristics/heuristics'
import { ZeroShotSettings } from '@/src/types/components/projects/projectId/heuristics/heuristicId/zero-shot'
import {
  LabelingTask,
  LabelingTaskTarget,
} from '@/src/types/components/projects/projectId/settings/labeling-tasks'
import { Attribute } from '@/src/types/components/projects/projectId/settings/data-schema'

export const CONFIDENCE_INTERVALS = [10, 20, 30, 40, 50, 60, 70, 80, 90]

export function postProcessZeroShot(
  heuristic: Heuristic,
  labelingTasks: LabelingTask[],
  attributes: Attribute[],
) {
  const prepareHeuristic = jsonCopy(heuristic)
  prepareHeuristic.labelSource = LabelSource.INFORMATION_SOURCE
  prepareHeuristic.informationSourceType =
    InformationSourceType[heuristic['type']]
  prepareHeuristic.selected = heuristic['isSelected']
  prepareHeuristic.stats = mapInformationSourceStats(
    heuristic['sourceStatistics']['edges'],
  )
  const labelingTask = labelingTasks.find(
    (a) => a.id == heuristic.labelingTaskId,
  )
  prepareHeuristic.labelingTaskName = labelingTask.name
  prepareHeuristic.stats.forEach((stat) => {
    stat.color = getColorStruct(stat.color)
  })
  prepareHeuristic.labels = labelingTask.labels
  prepareHeuristic.lastTask = heuristic['lastPayload']
  if (prepareHeuristic.lastTask) {
    const task = { ...prepareHeuristic.lastTask }
    if (task.createdAt && task.finishedAt) {
      task.durationText = timeDiffCalc(
        dateAsUTCDate(new Date(task.createdAt)),
        dateAsUTCDate(new Date(task.finishedAt)),
      )
    }
    prepareHeuristic.state = heuristic['lastPayload']['state']
    prepareHeuristic.lastTask = task
  } else {
    prepareHeuristic.lastTask = null
  }
  prepareHeuristic.zeroShotSettings = fillZeroShotSettings(
    prepareHeuristic.sourceCode,
    labelingTasks,
    prepareHeuristic.labelingTaskId,
    attributes,
  )
  return prepareHeuristic
}

function fillZeroShotSettings(
  settingsJson: string,
  labelingTasks: LabelingTask[],
  labelingTaskId: string,
  attributes: Attribute[],
) {
  const zeroShotSettings = parseZeroShotSettings(settingsJson)
  zeroShotSettings.taskId = labelingTaskId
  const findLabelingTask = labelingTasks.find(
    (task) => task.id == labelingTaskId,
  )
  zeroShotSettings.attributeSelectDisabled =
    attributes.length == 1 ||
    findLabelingTask.taskTarget == LabelingTaskTarget.ON_ATTRIBUTE
  if (!zeroShotSettings.attributeId) {
    zeroShotSettings.attributeId = findLabelingTask.attribute.id
  }
  zeroShotSettings.attributeName = attributes.find(
    (a) => a.id == zeroShotSettings.attributeId,
  )?.name
  return zeroShotSettings
}

export function parseZeroShotSettings(settingsJson: string): ZeroShotSettings {
  const tmp = JSON.parse(settingsJson)
  return {
    targetConfig: tmp.config,
    attributeId: tmp.attribute_id,
    minConfidence: tmp.min_confidence,
    excludedLabels: tmp.excluded_labels,
    runIndividually: tmp.run_individually,
    attributeName: '',
    attributeSelectDisabled: false,
  }
}

export function parseToSettingsJson(settings: ZeroShotSettings): string {
  const tmp = {
    config: settings.targetConfig,
    attribute_id: settings.attributeId,
    min_confidence: settings.minConfidence,
    excluded_labels: settings.excludedLabels,
    run_individually: settings.runIndividually,
    attributeName: settings.attributeName,
    attributeSelectDisabled: false,
  }
  return JSON.stringify(tmp)
}

export function postProcessZeroShotText(zeroShotText: any, labels: any[]) {
  const zeroShotTextCopy = jsonCopy(zeroShotText)
  zeroShotTextCopy.labels.forEach((label: any) => {
    label.confidenceText = (label.confidence * 100).toFixed(2) + '%'
    const labelColor = labels.find((l) => l.name == label.labelName)?.color
    label.color = labelColor
  })
  return zeroShotTextCopy
}

export function postProcessZeroShot10Records(
  zeroShotResults: any,
  labels: any[],
) {
  const prepareZeroShotResults = jsonCopy(zeroShotResults)
  prepareZeroShotResults.durationText =
    '~' + Math.round(prepareZeroShotResults.duration * 100) / 100 + ' sec'
  prepareZeroShotResults.records.forEach((record) => {
    record.shortView = true
    record.fullRecordData = JSON.parse(record.fullRecordData)
    record.labels.forEach((e) => {
      e.confidenceText = (e.confidence * 100).toFixed(2) + '%'
      const labelColor = labels.find((l) => l.name == e.labelName)?.color
      e.color = labelColor
    })
  })
  return prepareZeroShotResults
}
