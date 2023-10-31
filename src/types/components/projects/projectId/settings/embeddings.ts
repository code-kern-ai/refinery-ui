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
    attributeId?: string;
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

export type RecommendedEncoder = {
    applicability: string;
    configString: string;
    description: string;
    platform: string;
    tokenizers: string[];
}

export type SuggestionsProps = {
    options: string[];
    selectedOption: (value: any) => void;
    name?: string;
    tooltip?: string;
}

export type EmbeddingProps = {
    refetchWS(): void;
}

export type EmbeddingCreationEnabledProps = {
    platform: string;
    model: string;
    apiToken: string;
    termsAccepted: boolean;
    embeddings: Embedding[];
    targetAttribute: string;
    granularity: string;
    engine: string;
    url: string;
    version: string;
    embeddingPlatforms: EmbeddingPlatform[];
};