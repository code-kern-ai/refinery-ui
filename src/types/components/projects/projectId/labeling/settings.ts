import { LineBreaksType } from "../data-browser/data-browser";

export type LabelingSuiteSettings = {
    main: LabelingSuiteMainSettings;
    overviewTable: LabelingSuiteOverviewTableSettings;
    task: LabelingSuiteTaskHeaderSettings;
    labeling: LabelingSuiteLabelingSettings;
}

export type LabelingSuiteOverviewTableSettings = {
    show: boolean;
    showHeuristics: boolean;
    includeLabelDisplaySettings: boolean;
}

export type LabelingSuiteMainSettings = {
    autoNextRecord: boolean;
    hoverGroupBackgroundColor: string;
    hoverGroupBackgroundColorClass: string;
    // Special case - line breaks get synchronized with the data browser
    lineBreaks: LineBreaksType;
}
export type LabelingSuiteLabelingSettings = {
    showNLabelButton: number;
    showTaskNames: boolean;
    showHeuristicConfidence: boolean;
    compactClassificationLabelDisplay: boolean;
    swimLaneExtractionDisplay: boolean;
    closeLabelBoxAfterLabel: boolean;
}

//labeling task
export type LabelingSuiteTaskHeaderSettings = {
    show: boolean;
    isCollapsed: boolean;
    alwaysShowQuickButtons: boolean;
    //caution technically irritating because the line below is not for projectIds but for any string key -> thats why any needs to be added to allow isCollapsed boolean
    [projectId: string]: LabelingSuiteTaskHeaderProjectSettings | any;
}

export type LabelingSuiteTaskHeaderProjectSettings = {
    [taskId: string]: LabelingSuiteTaskHeaderTaskSettings
}

export type LabelingSuiteTaskHeaderTaskSettings = {
    [labelId: string]: LabelingSuiteTaskHeaderLabelSettings
}

export type LabelingSuiteTaskHeaderLabelSettings = {
    showManual: boolean;
    showWeakSupervision: boolean;
    showModel: boolean;
    showHeuristics: boolean;
}

export enum ComponentType {
    ALL = "ALL",
    MAIN = "MAIN",
    OVERVIEW_TABLE = "OVERVIEW_TABLE",
    LABELING = "LABELING",
    TASK_HEADER = "TASK_HEADER",
}
