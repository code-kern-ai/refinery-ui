import { SearchGroup } from "@/submodules/javascript-functions/enums/enums";

export type DataSlice = {
    id: string;
    name: string;
    filterRaw: any;
    initFilterRaw?: any;
    filterData: string; // is a JSONstring and gets parsed when applied
    static: boolean;
    count: number;
    sql: string;
    createdAt: string;
    createdBy: string;
    sliceType: string;
    info: string; // is a JSONstring and gets parsed when applied
    color: any;
    displayName: string;
};

export type SearchGroupElement = {
    group: SearchGroup;
    key: string;
    sortOrder: number;
    isOpen: boolean;
    inOpenTransition: boolean;
    name: string;
    nameAdd: string;
    subText: string;
};