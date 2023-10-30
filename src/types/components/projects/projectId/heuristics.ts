import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";

export type Heuristic = {
    id: string;
    selected: boolean;
    createdAt: string;
    createdBy: string;
    informationSourceType: InformationSourceType;
    labelSource: string;
    labelingTaskId: string;
    lastRun: string;
    name: string;
    returnType: string;
    stat_data: StatData[];
    state: string;
    stats: Stat[];
    routerLink: string;
    description: string;
};

export type StatData = {
    color: string;
    false_negatives: number;
    false_positives: number;
    id: string;
    label: string;
    labelId: string;
    record_coverage: number;
    source_conflicts: number;
    source_id: string;
    source_overlaps: number;
    total_hits: number;
    true_positives: number;
}

export type Stat = {
    color: string | Color;
    label: string;
    labelId: string;
    values: {
        Conflicts: number;
        Coverage: number;
        FalsePositives: number;
        FalseNegatives: number;
        Overlaps: number;
        Recall: number;
        TruePositives: number;
        Precision: number;
        TotalHits: number;
    }
}

export type Color = {
    name: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    hoverColor: string;
};

export type HeuristicCreationModalsProps = {
    heuristicType: InformationSourceType;
}