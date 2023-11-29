export type LabelingHuddle = {
    recordIds: string[];
    partial: boolean;
    linkData: LabelingLinkData;
    allowedTask: string;
    canEdit: boolean;
    checkedAt: {
        local: Date;
        db: Date;
    };
};

export type LabelingLinkData = {
    projectId: string;
    huddleId: string;
    requestedPos: number;
    linkType: LabelingLinkType;
    linkLocked?: boolean;
};

export enum LabelingLinkType {
    SESSION = 'SESSION',
    DATA_SLICE = 'DATA_SLICE',
    HEURISTIC = 'HEURISTIC',
}

export enum UserType {
    GOLD = 'GOLD',
    ALL = 'ALL',
    REGISTERED = 'REGISTERED',
}

export enum UpdateType {
    RECORD = 'RECORD',
    LABELING_TASKS = 'LABELING_TASKS',
    ATTRIBUTES = 'ATTRIBUTES',
    DISPLAY_USER = 'DISPLAY_USER',
}

export enum LabelingPageParts {
    TASK_HEADER = 'TASK_HEADER',
    LABELING = 'LABELING',
    OVERVIEW_TABLE = 'OVERVIEW_TABLE',
}