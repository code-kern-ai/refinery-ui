// small letters because they are also used as properties
export enum HeuristicsProperty {
    NAME = 'name',
    DESCRIPTION = 'description',
}

export type HeuristicsEditorProps = {
    updatedSourceCode: (code: string) => void;
}

export type HeuristicRunButtonsProps = {
    updateDisplayLogWarning?: (val: boolean) => void;
}