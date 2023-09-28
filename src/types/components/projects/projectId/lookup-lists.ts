export type LookupListCardProps = {
    lookupList: LookupListBE;
    index: number;
}

export type LookupListBE = {
    id: string;
    name: string;
    termCount: number;
    description: string;
}