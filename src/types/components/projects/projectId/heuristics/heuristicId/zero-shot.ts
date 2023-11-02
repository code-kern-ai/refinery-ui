export type ZeroShotSettings = {
    taskId?: string;
    targetConfig: string;
    attributeId: string;
    attributeSelectDisabled?: boolean;
    minConfidence: Number;
    excludedLabels: string[];
    runIndividually: boolean;
    attributeName: string;
};