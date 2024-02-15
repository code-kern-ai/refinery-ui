import { Attribute } from '@/src/types/components/projects/projectId/settings/data-schema'
import {
  LabelingTask,
  LabelingTaskTarget,
  LabelingTaskTaskType,
} from '@/src/types/components/projects/projectId/settings/labeling-tasks'
import { LabelHelper } from '@/src/util/classes/label-helper'

let rPos = { pos: 9990 } //as object to increase in private function

export function postProcessLabelingTasks(labelingTasks: any[]): any[] {
  const prepareLabelingTasks = labelingTasks
    .map((labelingTask: any) => {
      const data = labelingTask.node
      return {
        id: data.id,
        name: data.name,
        taskTarget: data.taskTarget,
        attribute: data.attribute,
        taskType: data.taskType,
        labels: !data.labels.edges
          ? []
          : data.labels.edges.map((edge) => {
              return edge.node
            }),
        informationSources: !data.informationSources.edges
          ? []
          : data.informationSources.edges.map((edge) => {
              return edge.node
            }),
        relativePosition: data.attribute?.relativePosition ?? rPos.pos++,
      }
    })
    .sort(
      (a, b) =>
        a.relativePosition - b.relativePosition || a.name.localeCompare(b.name),
    )
  return prepareLabelingTasks
}

export function postProcessLabelingTasksSchema(
  labelingTasks: LabelingTask[],
): LabelingTask[] {
  const prepareLabelingTasks = []
  labelingTasks.forEach((task) => {
    task.labels.sort((a, b) => a.name.localeCompare(b.name))
    LabelHelper.labelingTaskColors.set(
      task.id,
      task.labels.map((label) => label.color),
    )
    task.labels = task.labels.map((label) =>
      LabelHelper.extendLabelForColor({ ...label }),
    )
    task.nameOpen = false
    task.targetId =
      task.taskTarget == LabelingTaskTarget.ON_ATTRIBUTE
        ? task.attribute.id
        : ''
    task.targetName =
      task.taskTarget == LabelingTaskTarget.ON_ATTRIBUTE
        ? task.attribute.name
        : 'Full Record'
    LabelHelper.labelMap.set(task.id, task.labels)
    prepareLabelingTasks.push(task)
  })
  return prepareLabelingTasks
}

export function labelingTaskToString(
  source: LabelingTaskTaskType,
  forDisplay: boolean = true,
) {
  if (forDisplay) {
    switch (source) {
      // case LabelingTask.BINARY_CLASSIFICATION: return "Binary Classification";
      case LabelingTaskTaskType.MULTICLASS_CLASSIFICATION:
        return 'Multiclass classification'
      case LabelingTaskTaskType.INFORMATION_EXTRACTION:
        return 'Information extraction'
      case LabelingTaskTaskType.NOT_SET:
        return 'Not Set'
      default:
        return source
    }
  }
  return source
}

export function labelingTaskFromString(key: string) {
  switch (key) {
    // case "Binary Classification": return LabelingTaskTaskType.MULTICLASS_CLASSIFICATION;
    case 'Multiclass classification':
      return LabelingTaskTaskType.MULTICLASS_CLASSIFICATION
    case 'Information extraction':
      return LabelingTaskTaskType.INFORMATION_EXTRACTION
    case 'Not Set':
      return LabelingTaskTaskType.NOT_SET
    default:
      return key
  }
}

export function getAttributeArrayAttribute(
  attributeId: string,
  valueKey: string,
  attributes: Attribute[],
) {
  for (let i = 0; i < attributes.length; i++) {
    const att = attributes[i]
    if (attributeId == att.id) return att[valueKey]
  }
  return 'UNKNOWN'
}

export function isTaskNameUnique(
  labelingTasksSchema: LabelingTask[],
  value: string,
): boolean {
  return !labelingTasksSchema.some((task: LabelingTask) => task.name == value)
}
