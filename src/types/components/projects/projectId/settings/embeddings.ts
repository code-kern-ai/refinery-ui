export enum EmbeddingState {
    QUEUED = 'QUEUED',
    FINISHED = 'FINISHED',
    FAILED = 'FAILED',
}

export type Embedding = {
    id: string;
    applicability: string;
    configString: string;
    description: string;
    tokenizers: string[];
    hidden?: boolean;
    forceHidden?: boolean;
    state?: string;
    progress?: number;
    name?: string;
    platform?: string;
    model?: string;
    apiToken?: string;
    filterAttributes: string[];
    type?: string;
    dimension?: number;
    count?: number;
};

export enum EmbeddingType {
    ON_ATTRIBUTE = "ON_ATTRIBUTE",
    ON_TOKEN = "ON_TOKEN"
};