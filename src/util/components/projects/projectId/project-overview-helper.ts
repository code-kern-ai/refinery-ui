import { DisplayGraphs, ProjectStats } from "@/src/types/components/projects/projectId/overview";
import { percentRoundString } from "@/submodules/javascript-functions/general";

export function displayGraphsTypeToString(source: DisplayGraphs) {
    switch (source) {
        case DisplayGraphs.ALL: return "All";
        case DisplayGraphs.CONFUSION_MATRIX: return "Confusion Matrix";
        case DisplayGraphs.INTER_ANNOTATOR: return "Inter Annotator";
        case DisplayGraphs.LABEL_DISTRIBUTION: return "Label Distribution";
        case DisplayGraphs.CONFIDENCE_DISTRIBUTION: return "Confidence Distribution";
        default: return "";
    }
}

export function getDisplayGraphValueArray(): [{ value: number, name: string }] {
    let toReturn = [];
    for (const key in Object.keys(DisplayGraphs)) {
        if (isNaN(Number(key))) continue;
        const name = displayGraphsTypeToString(Number(key));
        if (name) toReturn.push({ value: key, name: name })

    }
    return toReturn as [{ value: number, name: string }];
}

export function getEmptyProjectStats(): ProjectStats {
    return {
        generalLoading: false, general: {}, generalPercent: {
            "INFORMATION_SOURCE": "n/a",
            "WEAK_SUPERVISION": "n/a",
            "MANUAL": "n/a"
        }, generalStats: {}, interAnnotatorLoading: false, interAnnotator: "n/a", interAnnotatorStat: -1
    }
}

// TODO: change any when the labeling tasks are defined
export function prepareLabelingTasks(labelingTasks: any) {
    const preparedLabelingTasks = [];

    return preparedLabelingTasks;
}

export function postProcessingStats(projectStats: ProjectStats[]): ProjectStats {
    const prepareProjectStats = getEmptyProjectStats();
    prepareProjectStats.generalStats = projectStats;
    if (prepareProjectStats.general == undefined) {
        prepareProjectStats.general = {};
        prepareProjectStats.generalPercent = {};
    }
    projectStats.forEach((element: any) => {
        if (element.source_type == 'INFORMATION_SOURCE') {
            prepareProjectStats.general[element.source_type] = element.absolut_labeled + " hitting on current slice\n" + element.records_in_slice + " defined in labeling task";
            prepareProjectStats.generalPercent[element.source_type] = element.absolut_labeled + " (" + element.records_in_slice + ")";
        } else {
            prepareProjectStats.general[element.source_type] = element.absolut_labeled + " of " + element.records_in_slice;
            prepareProjectStats.generalStats[element.source_type] = percentRoundString(element.percent, 2);
        }
    });
    prepareProjectStats.generalLoading = false;
    return prepareProjectStats;
}
