export type LabelingVars = {
    loading: boolean;
    loopAttributes: any[];
    taskLookup: {
        [attributeId: string]: {
            lookup: TaskLookup[];
            attribute: any;
        }; //this is typescript for all string keys -> so attributeId isn't "correct"
    }
}

type TaskLookup = {
    showText: boolean;
    showGridLabelPart: boolean;
    goldInfo?: {
        can: boolean,
        is: boolean,
    };
    gridRowSpan?: string;
    orderKey: number;
    task: any;
    tokenData?: any;
}

export type ExtractionDisplayProps = {
    attributeId: string;
    tokenLookup: TokenLookup;
    labelLookup: any;
    deleteRla: (rla: string) => void;
    setSelected: (start: number, end: number, e: any) => void;
}

export type TokenLookup = {
    [attributeId: string]: {
        token: any[],
        [tokenIdx: number]: {
            rlaArray: {
                orderPos: number,// globalPosition used for absolute positioning
                bottomPos: string,
                isFirst: boolean,
                isLast: boolean,
                hoverGroups: any,
                labelId: string,
                canBeDeleted: boolean,
                rla: any,
            }[],
            tokenMarginBottom: string,
        }
    }
}

export type LabelSelectionBoxProps = {
    position: {
        top: number;
        left: number;
    },
    activeTasks: any,
    labelLookup: any,
    addRla: (task, labelId: string) => void;
    labelAddButtonDisabled: boolean;
    addNewLabelToTask: (newLabel: string, task) => void;
    checkLabelVisibleInSearch: (newLabel: string, task) => void;
};

export type HotkeyLookup = {
    [hotkey: string]: {
        taskId: string,
        labelId: string
    }
}

export enum LabelSourceHover {
    MANUAL = "MANUAL",
    WEAK_SUPERVISION = "WEAK_SUPERVISION",
    INFORMATION_SOURCE = "INFORMATION_SOURCE",
    MODEL_CALLBACK = "MODEL_CALLBACK",
    MANUAL_GOLD = "MANUAL_GOLD",
}