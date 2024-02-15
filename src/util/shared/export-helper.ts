import {
  ExportEnums,
  ExportRecordFormGroup,
  ExportRowType,
} from '@/src/types/shared/export'
import { Status } from '@/src/types/shared/statuses'
import { dateAsUTCDate } from '@/submodules/javascript-functions/date-parser'
import { sliceTypeToString } from '@/submodules/javascript-functions/enums/enum-functions'
import { Slice } from '@/submodules/javascript-functions/enums/enums'

export const NONE_IN_PROJECT = 'NONE_IN_PROJECT'

let rPos = { pos: 9990 }

export default function postProcessExportRecordData(data: any) {
  let x: any = {
    projectId: data.id,
    name: data.name,
    labelingTasks: data.labelingTasks.edges.map((edge) => edge.node),
    informationSources: data.informationSources.edges.map((edge) => edge.node),
    attributes: data.attributes.edges
      .map((edge) => edge.node)
      .filter((att) =>
        [Status.UPLOADED, Status.USABLE, Status.AUTOMATICALLY_CREATED].includes(
          att.state,
        ),
      ),
    dataSlices: data.dataSlices.edges.map((edge) => edge.node),
  }
  x.dataSlices.forEach((element) => {
    if (element.sliceType == Slice.STATIC_OUTLIER) {
      element.name = dateAsUTCDate(new Date(element.createdAt)).toLocaleString()
    }
  })
  x.labelingTasks.forEach((task) => {
    task.relativePosition = labelingTaskRelativePosition(
      task.attribute?.relativePosition,
      rPos,
    )
  })
  x.labelingTasks.sort(
    (a, b) =>
      a.relativePosition - b.relativePosition || a.name.localeCompare(b.name),
  )
  if (x.informationSources.length == 0)
    x.informationSources.push({ id: NONE_IN_PROJECT, name: 'None in project' })
  if (x.labelingTasks.length == 0)
    x.informationSources.push({ id: NONE_IN_PROJECT, name: 'None in project' })
  if (x.attributes.length == 0)
    x.informationSources.push({ id: NONE_IN_PROJECT, name: 'None in project' })
  if (x.dataSlices.length == 0)
    x.dataSlices.push({ id: NONE_IN_PROJECT, name: 'None in project' })
  return x
}

function labelingTaskRelativePosition(
  relativePosition,
  rPos: { pos: number },
): number {
  if (relativePosition) return relativePosition
  rPos.pos += 1
  return rPos.pos
}

export function getExportTooltipFor(
  exportEnum: ExportEnums,
  element: any,
): string {
  switch (exportEnum) {
    case ExportEnums.ExportRowType:
      const key = element.value ? element.value : element.name
      switch (key) {
        case 'ALL':
          return 'Export all records in your project'
        case 'SESSION':
          return 'Export all records with your current data browser filter'
      }
      break
    case ExportEnums.DataSlices:
      return sliceTypeToString(element.sliceType)
  }

  return null
}

export function buildForm(arr: any[]): ExportRecordFormGroup {
  if (!arr) return null
  const formGroup = {} as ExportRecordFormGroup
  arr.forEach((v, i) => {
    const ctrlName = v.value ? v.value : v.name
    formGroup[ctrlName] = {
      active: i == 0,
      name: v.name,
      id: v.id,
      value: v.value,
      disabled: false,
    }
  })
  return formGroup
}

export function isEnumRadioGroup(v: ExportEnums) {
  switch (v) {
    case ExportEnums.ExportPreset:
    case ExportEnums.ExportFileType:
    case ExportEnums.ExportFormat:
    case ExportEnums.ExportRowType:
    case ExportEnums.DataSlices:
      return true
    default:
      return false
  }
}
