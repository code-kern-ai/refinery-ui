import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { LabelingTask } from "../settings/labeling-tasks";

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
    sourceCode: string;
    sourceCodeToDisplay: string;
    lastTask: any;
    durationText: string;
    labelingTaskName: string;
    labels: any;
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
    color: any;
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

export type HeuristicsHeaderProps = {
    filterList: (labelingTask: LabelingTask) => void;
    refetch: () => void;
}

export type CurrentWeakSupervision = {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        mail: string;
    }
    displayName: string;
    createdAt: string;
    createdAtDisplay: string;
    finishedAt: string;
    finishedAtDisplay: string;
    distinctRecords: number;
    resultCount: number;
    selectedInformationSources: string;
    selectedLabelingTasks: string;
    state: string;
}

export type DeleteHeuristicsModalProps = {
    countSelected: number;
    selectionList: string;
    refetch: () => void;
};