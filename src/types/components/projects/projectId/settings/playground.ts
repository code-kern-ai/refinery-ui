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