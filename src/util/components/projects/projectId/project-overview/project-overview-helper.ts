import { LabelDistribution } from "@/src/types/components/projects/projectId/project-overview/charts";
import { CardStatsEnum, ProjectStats } from "@/src/types/components/projects/projectId/project-overview/project-overview";
import { NOT_AVAILABLE } from "@/src/util/constants";
import { displayGraphsTypeToString } from "@/submodules/javascript-functions/enums/enum-functions";
import { DisplayGraphs, LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { percentRoundString } from "@/submodules/javascript-functions/general";

export function getDisplayGraphValueArray(): [{ value: DisplayGraphs, name: string }] {
    let toReturn = [];
    for (const key in DisplayGraphs) {
        const name = displayGraphsTypeToString(key as DisplayGraphs);
        if (name) toReturn.push({ value: key as DisplayGraphs, name: name })
    }
    return toReturn as [{ value: DisplayGraphs, name: string }];
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
        interAnnotatorStat: -1,
        tooltipsArray: []
    }
}

export function postProcessingStats(projectStats: ProjectStats[]): ProjectStats {
    const prepareProjectStats = getEmptyProjectStats();
    prepareProjectStats.generalStats = projectStats;
    if (prepareProjectStats.general == undefined) {
        prepareProjectStats.general = {};
        prepareProjectStats.generalPercent = {};
        prepareProjectStats.tooltipsArray = [];
    }
    projectStats.forEach((element: any) => {
        if (element.source_type == 'INFORMATION_SOURCE') {
            prepareProjectStats.general[element.source_type] = element.absolut_labeled + " hitting on current slice\n" + element.records_in_slice + " defined in labeling task";
            const tooltipsArray = [element.absolut_labeled + " hitting on current slice", element.records_in_slice + " defined in labeling task"];
            prepareProjectStats.tooltipsArray[element.source_type] = tooltipsArray;
            prepareProjectStats.generalPercent[element.source_type] = element.absolut_labeled + " (" + element.records_in_slice + ")";
        } else {
            prepareProjectStats.general[element.source_type] = element.absolut_labeled + " of " + element.records_in_slice;
            prepareProjectStats.generalStats[element.source_type] = percentRoundString(element.percent, 2);
        }
    });
    prepareProjectStats.generalLoading = false;
    return prepareProjectStats;
}

export function postProcessLabelDistribution(data: string): LabelDistribution[] {
    return matchAndMergeLabelDistributionData(JSON.parse(data));
}

function matchAndMergeLabelDistributionData(data): LabelDistribution[] {
    let returnData = [];
    if (!data) return returnData;
    data.forEach(e => {
        let found = returnData.find(x => x.labelId == e.id);
        if (!found) {
            found = {
                labelId: e.id,
                labelName: e.name,
                ratioScaleManually: 0,
                absoluteScaleManually: 0,
                ratioScaleProgrammatically: 0,
                absoluteScaleProgrammatically: 0
            };
            returnData.push(found);
        }
        if (e.source_type == CardStatsEnum.MANUAL) {
            found.ratioScaleManually = e.count_relative;
            found.absoluteScaleManually = e.count_absolute;
        } else if (e.source_type == CardStatsEnum.WEAK_SUPERVISION) {
            found.ratioScaleProgrammatically = e.count_relative;
            found.absoluteScaleProgrammatically = e.count_absolute;
        }
    });
    return returnData;
}

export function postProcessConfusionMatrix(data: string, dataNeedsParse: boolean = true): any {
    if (!data) return [];
    const d = dataNeedsParse ? JSON.parse(data) : data;

    return d.map((e) => {
        return {
            counts: e.count_absolute,
            labelIdManual: e.label_name_manual == '@@OUTSIDE@@' ? 'Outside' : e.label_name_manual,
            labelIdProgrammatic: e.label_name_ws == '@@OUTSIDE@@' ? 'Outside' : e.label_name_ws
        }
    });
}

export function calcInterAnnotatorAvg(interAnnotatorMatrix, projectStats: ProjectStats) {
    const projectStatsCopy = { ...projectStats }
    let c = 0;
    let s = 0;
    interAnnotatorMatrix.elements.forEach(e => {
        if (e.userIdA != e.userIdB && e.percent != -1) {
            c++;
            s += e.percent;
        }
    });
    if (c) {
        projectStatsCopy.interAnnotator = Number(c / 2) + " with intersections";
        projectStatsCopy.interAnnotatorStat = s / c;
        projectStatsCopy.interAnnotatorStat = percentRoundString(projectStatsCopy.interAnnotatorStat, 2);
    } else {
        projectStatsCopy.interAnnotator = "No intersections";
        projectStatsCopy.interAnnotatorStat = -1;
    }
    return projectStatsCopy;
}