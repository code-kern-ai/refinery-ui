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

export type PlaygroundQuestion = {
    id: string;
    createdAt: string;
    createdBy: string;
    embeddingId: string;
    metaInfo: any;
    projectId: string;
    question: string;
    recordIds: any[];
};