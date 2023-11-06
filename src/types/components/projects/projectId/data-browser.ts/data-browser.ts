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