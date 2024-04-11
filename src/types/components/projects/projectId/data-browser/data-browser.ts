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
    info: { [key: string]: any };
    color: any;
    displayName: string;
};

export type SearchGroupElement = {
    group: SearchGroup;
    key: string;
    sortOrder: number;
    isOpen: boolean;
    name: string;
    nameAdd: string;
    subText: string;
};

export type SearchRecordsExtended = {
    fullCount: number;
    queryLimit: number;
    queryOffset: number;
    recordList: any[];
    sessionId: string;
};

export type RecordListProps = {
    editRecord: (index: number) => void;
    recordClicked: (index: number) => void;
}

export type ColumnData = {
    field: string;
    displayName: string;
    order: number;
};

export enum LineBreaksType {
    NORMAL = 'NORMAL',
    IS_PRE_WRAP = 'IS_PRE_WRAP',
    IS_PRE_LINE = 'IS_PRE_LINE',
}

export type DataBrowserRecordsProps = {
    refetchNextRecords: () => void;
    clearSearchRequest: () => void;
};