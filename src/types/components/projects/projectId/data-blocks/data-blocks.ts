import { LLMConfig } from "../settings/data-schema";

export type DataBlock = {
    id: string;
    name: string;
    description: string;
    type: DataBlockType;
    selected: boolean;
    createdAt: string;
    createdBy: string;
    organizationId: string;
    projectId: string;
    sqlData: any[];
    sqlConfig: {
        template: string,
        config: {
            selectClause?: string,
            whereClause?: string,
            groupByClause?: string,
            orderByClause?: string,
        }
    };
    sqlSchema: DataBlockColumn[];
};

export type DeleteDataBlockModalProps = {
    countSelected: number;
    selectionList: string;
    refetch: () => void;
};

export type DataBlocksHeaderProps = {
    refetch: () => void;
}

export enum DataBlockType {
    LIVE = 'LIVE',
    STABLE = 'STABLE',
}

export enum DataBlockProperty {
    NAME = 'name',
    DESCRIPTION = 'description',
}

export enum QuestionType {
    CATALOGUE = 'CATALOGUE',
    CUSTOM = 'CUSTOM',
}

export enum SQLTemplates {
    BLANK_QUERY = 'BLANK_QUERY',
    INTEGRATION_AUDIT = 'INTEGRATION_AUDIT',
}

export type DataBlockColumn = {
    id: string;
    dataBlockId: string;
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
    sourceCode: string;
    userCreated: boolean;
    state: string;
    logs: string[];
    relativePosition: number;
    dataTypeName?: string;
    visibilityIndex?: number;
    active?: boolean;
    negate?: boolean;
    color?: string;
    progress?: number;
    sourceCodeToDisplay?: string;
    saveSourceCode: boolean;
    key?: string;
    additionalConfig?: LLMConfig;
    columnName: string;
    columnDataType: string;
}

export enum DataBlockColumnState {
    UPLOADED = 'UPLOADED',
    AUTOMATICALLY_CREATED = 'AUTOMATICALLY_CREATED',
    USABLE = 'USABLE',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    QUEUED = 'QUEUED',
    INITIAL = 'INITIAL',
}

export enum DataBlockColumnType {
    CATEGORY = 'CATEGORY',
    TEXT = 'TEXT',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    BOOLEAN = 'BOOLEAN',
    LLM_RESPONSE = 'LLM_RESPONSE',
}