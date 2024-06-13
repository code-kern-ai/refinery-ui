// small letters because they are also used as properties
export enum HeuristicsProperty {
    NAME = 'name',
    DESCRIPTION = 'description',
}

export type HeuristicsEditorProps = {
    updatedSourceCode: (code: string) => void;
    embedding?: string;
    isInitial: boolean;
    setIsInitial: (val: boolean) => void;
    setCheckUnsavedChanges: (val: boolean) => void;
}

export type HeuristicRunButtonsProps = {
    updateDisplayLogWarning?: (val: boolean) => void;
    runOn10IsRunning?: boolean;
    justClickedRun?: (val: boolean) => void;
    checkCanStartHeuristic?: (val: boolean) => void;
}