//int based enough since not used outside of frontend
export enum DisplayGraphs {
    ALL,
    CONFUSION_MATRIX,
    INTER_ANNOTATOR,
    LABEL_DISTRIBUTION,
    CONFIDENCE_DISTRIBUTION,
}

export type ProjectStats = {
    generalLoading: boolean;
    general: {};
    generalPercent: {};
    generalStats: {};
    interAnnotatorLoading: boolean;
    interAnnotator: string;
    interAnnotatorStat: number;
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
