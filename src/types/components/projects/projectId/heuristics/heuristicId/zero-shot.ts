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

export type ZeroShotExecutionProps = {
    customLabels: string;
    setIsModelDownloading: (isDownloading: boolean) => void;
};

export type PlaygroundProps = {
    setIsModelDownloading: (isDownloading: boolean) => void;
};