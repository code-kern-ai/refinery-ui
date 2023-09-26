export type Project = {
    id: string;
    createdAt: string;
    description: string;
    name: string;
    numDataScaleUploaded: number;
    projectType: string;
    user: {
        firstName: string;
        lastName: string;
        mail: string;
    }
    status: ProjectStatus;
    timeStamp: string;
    date: string;
    time: string
}

export enum ProjectStatus {
    INIT = 'INIT',
    INIT_COMPLETE = 'INIT_COMPLETE',
    IN_DELETION = 'IN_DELETION',
    INIT_SAMPLE_PROJECT = 'INIT_SAMPLE_PROJECT',
}

export type ProjectStatistics = {
    projectId: string;
    numDataScaleUploaded: number;
    numDataScaleManual: number;
    numDataScaleProgrammatical: number;
    numDataTestManual?: number;
    numDataTestUploaded?: number;
    manuallyLabeled: string;
    weaklySupervised: string;
}

export type ProjectCardProps = {
    project: Project;
    projectStatisticsById: { [key: string]: ProjectStatistics };
    adminDeleteProject: () => void;
}