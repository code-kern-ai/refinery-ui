export type DataBlock = {
    id: string;
    name: string;
    description: string;
    type: DataBlockType;
    selected: boolean;
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

export enum QuestionCatalogueOptions {
    OVERVIEW = "Provide an overview of the knowledge graph."
}