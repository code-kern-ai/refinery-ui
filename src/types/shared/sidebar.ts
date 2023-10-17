export enum UserRole {
    ENGINEER = 'ENGINEER',
    ANNOTATOR = 'ANNOTATOR',
    EXPERT = 'EXPERT',
}

export type VersionOverview = {
    installedVersion: string;
    lastChecked: string;
    link: string;
    remoteHasNewer: boolean;
    remoteVersion: string;
    service: string;
    parseDate: string;
};