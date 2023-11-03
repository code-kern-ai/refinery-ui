export type CrowdLabelerHeuristicSettings = {
    taskId?: string;
    dataSliceId: string;
    annotatorId: string;
    accessLinkId: string;
    accessLink?: any;
    accessLinkParsed?: string;
    accessLinkLocked?: boolean;
    isHTTPS?: boolean;
};