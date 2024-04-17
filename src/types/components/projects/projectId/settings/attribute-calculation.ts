import { Attribute } from "./data-schema";

export type ExecutionContainerProps = {
    currentAttribute: Attribute;
    tokenizationProgress: number;
    refetchCurrentAttribute: () => void;
    checkUnsavedChanges: boolean;
    enableRunButton: boolean;
    setEnabledButton(value: boolean): void;
}

export type SampleRecord = {
    calculatedAttributes: any[];
    recordIds: string[];
    calculatedAttributesList: any[];
    calculatedAttributesDisplay: any[];
    calculatedAttributesListDisplay: any[];
};

export type ContainerLogsProps = {
    logs: any;
    type: string;
}

export type Record = {
    id: string;
    data: any;
    category: string;
    projectId: string;
}

export type ViewRecordDetailsModalProps = {
    currentAttribute: Attribute;
    sampleRecords: SampleRecord;
}

export type ConfirmExecutionModalProps = {
    currentAttributeId: string;
}