import { LabelingSuiteTaskHeaderTaskSettings } from "./settings";

export type LabelingSuiteTaskHeaderDisplayData = {
    id: string;
    name: string;
    hoverGroups: string;
    settings: LabelingSuiteTaskHeaderTaskSettings;
    orderPos: number;
    labels: {
        [labelId: string]: LabelingSuiteTaskHeaderLabelDisplayData
    };
    labelOrder: string[];//labelId array
}

export type LabelingSuiteTaskHeaderLabelDisplayData = {
    id: string;
    taskId: string;
    name: string;
    hoverGroups: string;
    hotkey: string;
    color: {
        name: string;
        backgroundColor: string;
        textColor: string;
        borderColor: string;
    }
}

export type QuickButtonConfig = {
    showManual: string[];
    showWeakSupervision: string[];
    showModel: string[];
    showHeuristics: string[];
    all: string[];
    nothing: string[];
    default: string[];

}

export enum HoverGroupTarget {
    TYPE = 'type',
    TASK = 'task',
    LABEL = 'label',
    CREATED_BY = 'createdBy',
    RLA_ID = 'rlaId',
}

export type HeaderDisplayProps = {
    displayData: LabelingSuiteTaskHeaderDisplayData[];
}

export type QuickButtonProps = {
    attributeName: string;
    caption: string;
    dataTipCaption: string;
    hoverClass?: string;
    setAllLabelDisplaySetting: () => void;
}

export type QuickButtonsProps = {
    labelSettingsLabel?: any;
}

export type LabelSettingsBoxProps = {
    labelSettingsLabel?: any;
}