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
    sqlConfig: {
        template: string,
        config: {
            select_clause?: string,
            where_clause?: string,
            group_by_clause?: string,
            order_by_clause?: string,
        }
    };
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
    BLANK_QUERY = 'BLANK_QUERY'
}