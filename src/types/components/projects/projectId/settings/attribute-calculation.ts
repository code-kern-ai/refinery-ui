import { Attribute } from "./data-schema";

export type ExecutionContainerProps = {
    currentAttribute: Attribute;
    tokenizationProgress: number;
}

export type SampleRecord = {
    calculatedAttributes: any[];
    recordIds: string[];
    calculatedAttributesList: string[];
};

export type ContainerLogsProps = {
    currentAttribute: Attribute;
}