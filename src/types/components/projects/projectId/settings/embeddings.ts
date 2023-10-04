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

export type EmbeddingPlatform = {
    platform: string;
    name: string;
    terms: string;
    splitTerms: string[];
    link: string;
}

// A string enum with different values from our standard is used because of its usage in the embedder service
export enum PlatformType {
    HUGGING_FACE = "huggingface",
    OPEN_AI = "openai",
    COHERE = "cohere",
    PYTHON = "python",
    AZURE = "azure"
}