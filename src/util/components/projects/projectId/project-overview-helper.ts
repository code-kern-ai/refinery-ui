import { ProjectStats } from "@/src/types/components/projects/projectId/overview";
import { NOT_AVAILABLE } from "@/src/util/constants";
import { displayGraphsTypeToString } from "@/submodules/javascript-functions/enums/enum-functions";
import { DisplayGraphs, LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { percentRoundString } from "@/submodules/javascript-functions/general";

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
        generalLoading: false,
        general: {},
        generalPercent: {
            [LabelSource.INFORMATION_SOURCE]: NOT_AVAILABLE,
            [LabelSource.WEAK_SUPERVISION]: NOT_AVAILABLE,
            [LabelSource.MANUAL]: NOT_AVAILABLE
        },
        generalStats: {},
        interAnnotatorLoading: false,
        interAnnotator: NOT_AVAILABLE,
        interAnnotatorStat: -1
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
