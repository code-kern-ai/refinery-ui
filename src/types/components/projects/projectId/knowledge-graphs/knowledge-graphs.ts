export type KnowledgeGraph = {
    id: string;
    name: string;
    description: string;
    type: KnowledgeGraphType;
    selected: boolean;
};


export type DeleteKnowledgeGraphModalProps = {
    countSelected: number;
    selectionList: string;
    refetch: () => void;
};

export type KnowledgeGraphsHeaderProps = {
    refetch: () => void;
}

export enum KnowledgeGraphType {
    LIVE = 'LIVE',
    STABLE = 'STABLE',
}