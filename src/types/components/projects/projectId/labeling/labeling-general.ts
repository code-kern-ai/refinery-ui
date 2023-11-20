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

export type UserData = {
    data: any;
    avatarUri: string;
    isLoggedInUser: boolean;
}