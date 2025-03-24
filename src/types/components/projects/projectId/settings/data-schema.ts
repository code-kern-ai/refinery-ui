export type DataSchemaProps = {
    isAcOrTokenizationRunning: boolean;
    pKeyValid: boolean;
};

export type LLMConfig = {
    llmIdentifier: string;
    questionPrompt: string;
    templatePrompt: string;
    llmConfig: {
        model: string;
        temperature: number;
        maxLength: number;
        stopSequences: string[]; //not in use for llm ac since json mode is used
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
        apiKey: string;
        apiVersion?: string, //only for azure
        endpoint?: string,  //only for azure
        openAioSeries?: boolean; //only for openai models
    }
}

export type Attribute = {
    id: string;
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
    sourceCode: string;
    visibility: AttributeVisibility;
    userCreated: boolean;
    state: string;
    logs: string[];
    relativePosition: number;
    dataTypeName?: string;
    visibilityIndex?: number;
    active?: boolean;
    negate?: boolean;
    color?: string;
    visibilityName?: string;
    progress?: number;
    sourceCodeToDisplay?: string;
    saveSourceCode: boolean;
    key?: string;
    additionalConfig?: LLMConfig;
}

export type AttributeVisibilityStates = {
    name: string;
    value: string;
};

export enum AttributeVisibility {
    HIDE = 'HIDE',
    HIDE_ON_LABELING_PAGE = 'HIDE_ON_LABELING_PAGE',
    HIDE_ON_DATA_BROWSER = 'HIDE_ON_DATA_BROWSER',
    DO_NOT_HIDE = 'DO_NOT_HIDE',
}


export enum AttributeState {
    UPLOADED = 'UPLOADED',
    AUTOMATICALLY_CREATED = 'AUTOMATICALLY_CREATED',
    USABLE = 'USABLE',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    QUEUED = 'QUEUED', //special state since not in db but "overwritten" if queue entry exists
    INITIAL = 'INITIAL',
}