import { Attribute } from "./data-schema";

export type ExecutionContainerProps = {
    currentAttribute: Attribute;
    tokenizationProgress: number;
}

export type SampleRecord = {
    calculatedAttributes: any[];
    recordIds: string[];
    calculatedAttributesList: any[];
};

export type ContainerLogsProps = {
    currentAttribute: Attribute;
}

export type Record = {
    id: string;
    data: any;
    category: string;
    projectId: string;
}