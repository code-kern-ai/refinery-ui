export type LookupListCardProps = {
    lookupList: LookupList;
    index: number;
}

export type LookupList = {
    id: string;
    name: string;
    termCount: number;
    description: string;
    pythonVariable: string;
}

export type Term = {
    blacklisted: boolean;
    comment: string;
    id: string;
    value: string;
}

// small letters because they are also used as properties
export enum LookupListProperty {
    NAME = 'name',
    DESCRIPTION = 'description',
}

export type TermsProps = {
    terms: Term[];
    finalSize: number;
    refetchTerms: () => void;
    setTerms: (terms: Term[]) => void;
}

export type LookupListOperationsProps = {
    refetchWS: () => void;
}

export type DeleteLookupListsModalProps = {
    countSelected: number;
    selectionList: string;
};