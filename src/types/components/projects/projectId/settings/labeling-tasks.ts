import { Attribute } from "./data-schema";

export type LabelingTask = {
    id: string;
    name: string;
    taskTarget: string;
    attribute: Attribute;
    taskType: LabelingTaskTaskType;
    relativePosition: number;
    labels: any[];
    informationSources: any[];
    nameOpen?: boolean;
    targetId?: string;
    targetName?: string;
};

export type LabelColors = {
    name: string,
    backgroundColor: string,
    textColor: string,
    borderColor: string,
    hoverColor: string
}

export type CurrentLabel = {
    label: any,
    taskId: string,
}

export type RenameLabelData = {
    checkResults: any,
    newLabelName: string,
    canCheck: boolean
}

export enum LabelingTaskTarget {
    ON_ATTRIBUTE = "ON_ATTRIBUTE",
    ON_WHOLE_RECORD = "ON_WHOLE_RECORD"
}

export enum LabelingTaskTaskType {
    //BINARY_CLASSIFICATION = "BINARY_CLASSIFICATION", // Currently diabled
    MULTICLASS_CLASSIFICATION = "MULTICLASS_CLASSIFICATION",
    INFORMATION_EXTRACTION = "INFORMATION_EXTRACTION",
    NOT_USEABLE = "NOT_USEABLE", //e.g. for annotators who can only use one task
    NOT_SET = "NOT_SET"
}