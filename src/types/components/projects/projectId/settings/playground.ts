export type EvaluationSet = {
    id: string;
    createdAt: string;
    createdBy: string;
    recordIds: string[];
    projectId: string;
    question: string;
}

export type EvaluationGroup = {
    id: string;
    createdAt: string;
    createdBy: string;
    evaluationSetIds: string[];
    projectId: string;
    name: string;
}

export type EvaluationRun = {
    id: string;
    evaluationGroupId: string;
    createdBy: string;
    createdAt: string;
    embeddingId: string;
    state: string;
    results: any;
    metaInfo: any;
}

export enum EvaluationRunState {
    INITIATED = 'INITIATED',
    RUNNING = 'RUNNING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}