export enum ExportEnums {
    ExportPreset = "ExportPreset",
    ExportRowType = "ExportRowType",
    ExportFileType = "ExportFileType",
    ExportFormat = "ExportFormat",
    LabelSource = "LabelSource",

    Heuristics = "Heuristics",
    Attributes = "Attributes",
    LabelingTasks = "LabelingTasks",
    DataSlices = "DataSlices"
}


export enum ExportPreset {
    DEFAULT = "DEFAULT",
    CUSTOM = "CUSTOM"
}

export enum ExportRowType {
    ALL = "ALL",
    SLICE = "SLICE", //SLICE is expected from backend, DATA_SLICE can't be used
    SESSION = "SESSION"
}

export enum ExportFileType {
    JSON = "JSON",
    CSV = "CSV",
    XLSX = "XLSX"
}
export enum ExportFormat {
    DEFAULT = "DEFAULT"
}

export type ExportRecordFormGroup = {
    active: boolean,
    name: string,
    id: string,
    value: string
}

export type GroupDisplayProps = {
    enumArrays: any,
    formGroup: any,
    type: ExportEnums,
    hiddenCheckCtrl: boolean,
    heading: string,
    subText: string,
    isCheckbox: boolean,
    setPresetValues: (formGroup: any) => void,
    updateFormGroup: (formGroup: any, type: ExportEnums) => void,
}