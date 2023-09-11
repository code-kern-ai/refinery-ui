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
}

export enum ProjectStatus {
    INIT = 'INIT',
    INIT_COMPLETE = 'INIT_COMPLETE',
    IN_DELETION = 'IN_DELETION'
}

export type ProjectStatistics = {
    projectId: string;
    numDataScaleUploaded: number;
    numDataScaleManual: number;
    numDataScaleProgrammatical: number;
    numDataTestManual?: number;
    numDataTestUploaded?: number;
}
