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