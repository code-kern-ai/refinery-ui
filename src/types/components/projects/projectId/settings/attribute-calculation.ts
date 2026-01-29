import { DataBlockColumn } from "../data-blocks/data-blocks";
import { Attribute } from "./data-schema";

export type ExecutionContainerProps = {
    currentAttribute: Attribute | DataBlockColumn;
    tokenizationProgress?: number;
    refetchCurrentAttribute: () => void;
    checkUnsavedChanges: boolean;
    enableRunButton: boolean;
    setEnabledButton(value: boolean): void;
    isDataBlockColumn?: boolean;
}

export type SampleRecord = {
    calculatedAttributes: any[];
    recordIds: string[];
    calculatedAttributesList: any[];
    calculatedAttributesDisplay: any[];
    calculatedAttributesListDisplay: any[];
    id: number;
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
    currentAttribute: Attribute | DataBlockColumn;
    sampleRecords: any;
}

export type ConfirmExecutionModalProps = {
    currentAttributeId: string;
    dataBlockId?: string | null;
}