import { DisplayGraphs } from "@/submodules/javascript-functions/enums/enums";

export type ProjectStats = {
    generalLoading: boolean;
    general: {};
    generalPercent: {};
    generalStats: {};
    interAnnotatorLoading: boolean;
    interAnnotator: string;
    interAnnotatorStat: number | string;
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
    INTER_ANNOTATOR = "INTER_ANNOTATOR",
}

export type ProjectOverviewFilters = {
    graphType: { name: string, value: DisplayGraphs };
    targetAttribute: string;
    labelingTask: string;
    dataSlice: string;
};

export type BarChartProps = {
    dataInput: any;
}