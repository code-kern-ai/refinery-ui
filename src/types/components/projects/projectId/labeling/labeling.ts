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