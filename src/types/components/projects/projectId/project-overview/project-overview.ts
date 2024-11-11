
export type ProjectStats = {
    generalLoading: boolean;
    general: {};
    generalPercent: {};
    generalStats: {};
    tooltipsArray?: any;
};

export type ProjectOverviewCardsProps = {
    projectStats: ProjectStats;
}

export type CardStats = {
    color: string;
    label: string;
    stats: string;
    link: string;
    linkLabel: string;
}

export enum CardStatsEnum {
    MANUAL = "MANUAL",
    WEAK_SUPERVISION = "WEAK_SUPERVISION",
    INFORMATION_SOURCE = "INFORMATION_SOURCE",
}

export type ProjectOverviewFilters = {
    targetAttribute: string;
    labelingTask: string;
    dataSlice: string;
};

export type BarChartProps = {
    dataInput: any;
}