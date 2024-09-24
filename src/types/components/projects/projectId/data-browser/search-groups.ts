import { SearchGroup } from "@/submodules/javascript-functions/enums/enums";
import { SearchOperator } from "./search-operators";

export type SearchGroupItem = {
    type: SearchItemType;
    defaultValue?: string;
    group: SearchGroup;
    groupKey: string;
    addText: string;
    operator?: SearchOperator;
    hasComments?: boolean;
};

export enum SearchItemType {
    ATTRIBUTE = 'ATTRIBUTE',
    LABELING_TASK = 'LABELING_TASK',
    ORDER_BY = 'ORDER_BY',
    COMMENTS = 'COMMENTS'
}