import { ExportEnums, ExportRowType } from '@/src/types/shared/export'
import { LabelSource } from '@/submodules/javascript-functions/enums/enums'
import { NONE_IN_PROJECT } from '../shared/export-helper'

export class ExportHelper {
  public static error: string[] = []

  public static buildExportData(sessionId: string, formGroup: any): string {
    this.error = []
    const exportData = {
      rows: this.buildExportDataRows(sessionId, formGroup),
      columns: this.buildExportDataColumns(formGroup),
      file_type: this.firstActiveInGroup(
        ExportEnums.ExportFileType,
        'value',
        formGroup,
      ),
      format: this.firstActiveInGroup(
        ExportEnums.ExportFormat,
        'value',
        formGroup,
      ),
    }
    if (
      exportData.columns.labeling_tasks.length == 0 &&
      exportData.columns.sources.length == 0 &&
      exportData.columns.attributes.length == 0
    ) {
      this.error.push('Nothing to export')
    }
    return JSON.stringify(exportData)
  }

  private static buildExportDataRows(sessionId: string, formGroup: any): any {
    let type = this.firstActiveInGroup(
      ExportEnums.ExportRowType,
      'value',
      formGroup,
    )
    let id
    if (type == ExportRowType.ALL) id = null
    else if (type == ExportRowType.SLICE) {
      id = this.firstActiveInGroup(ExportEnums.DataSlices, 'id', formGroup)
    } else if (type == ExportRowType.SESSION) id = sessionId
    return { type: type, id: id }
  }

  public static firstActiveInGroup(
    group: ExportEnums,
    returnAttribute: string = null,
    formGroup: any,
  ): string {
    const values = formGroup[group]
    for (let key in values) {
      if (values[key].active) {
        if (values[key].id == NONE_IN_PROJECT) {
          this.error.push('No active value found in group - ' + group)
          return null
        }
        return returnAttribute ? values[key][returnAttribute] : key
      }
    }
    this.error.push('No active value found in group - ' + group)
    return null
  }
  private static allActive(
    group: ExportEnums,
    returnAttribute: string,
    formGroup: any,
  ): any[] {
    const values = formGroup[group]
    let result = []
    for (let key in values) {
      if (
        group == ExportEnums.LabelingTasks &&
        values[key].id == NONE_IN_PROJECT
      )
        continue
      if (values[key].active)
        returnAttribute
          ? result.push(values[key][returnAttribute])
          : result.push(values[key])
    }
    return result
  }
  //no return type to make use of the implicit typing
  private static buildExportDataColumns(formGroup: any) {
    return {
      labeling_tasks: this.allActive(
        ExportEnums.LabelingTasks,
        'id',
        formGroup,
      ),
      attributes: this.allActive(ExportEnums.Attributes, 'id', formGroup),
      sources: this.buildExportDataSources(formGroup),
    }
  }
  private static buildExportDataSources(formGroup: any): any[] {
    const sources = []
    const active = this.allActive(ExportEnums.LabelSource, 'value', formGroup)
    for (let source of active) {
      if (source == LabelSource.INFORMATION_SOURCE) {
        sources.push(
          ...this.allActive(ExportEnums.Heuristics, 'id', formGroup).map(
            (v) => ({ type: source, id: v }),
          ),
        )
      } else sources.push({ type: source, id: null })
    }
    return sources
  }
}
