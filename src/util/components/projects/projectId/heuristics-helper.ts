import { CurrentWeakSupervision, Heuristic } from "@/src/types/components/projects/projectId/heuristics";
import { InformationSourceType, LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { Color } from "@/src/types/components/projects/projectId/heuristics";
import { jsonCopy, percentRoundString } from "@/submodules/javascript-functions/general";
import { InformationSourceCodeLookup, InformationSourceExamples } from "@/src/util/classes/heuristics";
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { UNKNOWN_USER } from "@/src/util/constants";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";

export const ACTIONS_DROPDOWN_OPTIONS = ['Select all', 'Deselect all', 'Run selected', 'Delete selected'];
export const NEW_HEURISTICS = ['Labeling function', 'Active learning', 'Zero-shot', 'Crowd labeler'];

export function postProcessHeuristics(heuristics: string, projectId: string): Heuristic[] {
    if (!heuristics) return [];
    return JSON.parse(heuristics).map((source: Heuristic) => {
        source.labelSource = LabelSource.INFORMATION_SOURCE;
        source.stats = mapInformationSourceStatsGlobal(source.stat_data);
        source.stats.forEach((stat) => {
            stat.color = getColorStruct(stat.color);
        });
        source.routerLink = getRouterLinkHeuristic(source.informationSourceType, projectId, source.id);
        return source;
    });
}

export function mapInformationSourceStatsGlobal(data) {
    if (data?.length) {
        return data.map((wrapper) => {
            return convertStatDataGlobal(wrapper)
        })
    } else {
        return [convertStatDataGlobal()];
    }
}
function convertStatDataGlobal(data = null) {
    return {
        label: !data ? '-' : data.label,
        color: !data ? '-' : data.color,
        labelId: !data ? '-' : data.labelId,
        values: {
            'TruePositives': !data ? '-' : data.true_positives,
            'FalsePositives': !data ? '-' : data.false_positives,
            'FalseNegatives': !data ? '-' : data.false_negatives,
            'Precision': !data ? '-' : percentRoundString(getPrecision(data.true_positives, data.false_positives)),
            'Recall': !data ? '-' : getRecall(data.true_positives, data.false_negatives),
            Coverage: !data ? '-' : data.record_coverage,
            TotalHits: !data ? '-' : data.total_hits,
            Conflicts: !data ? '-' : data.source_conflicts,
            Overlaps: !data ? '-' : data.source_overlaps,
        },
    }
}

function getPrecision(tp: number, fp: number): number {
    if (tp + fp == 0) {
        return 0;
    } else {
        return tp / (tp + fp);
    }
}

function getRecall(tp: number, fn: number): number {
    if (tp + fn == 0) {
        return 0;
    } else {
        return tp / (tp + fn);
    }
}

function getColorStruct(color: any): Color {
    return {
        name: color,
        backgroundColor: 'bg-' + color + '-100',
        textColor: 'text-' + color + '-700',
        borderColor: 'border-' + color + '-400',
        hoverColor: 'hover:bg-' + color + '-200',
    }
}

export function getFunctionName(heuristicType: InformationSourceType) {
    switch (heuristicType) {
        case InformationSourceType.LABELING_FUNCTION:
            return 'my_labeling_function';
        case InformationSourceType.ACTIVE_LEARNING:
            return 'MyActiveLearner';
        case InformationSourceType.ZERO_SHOT:
            return 'Zero Shot module';
        case InformationSourceType.CROWD_LABELER:
            return 'Crowd Heuristic';
    }
}

export const DEFAULT_DESCRIPTION = 'provide some description for documentation';

export function getInformationSourceTemplate(matching: any, type: InformationSourceType, embedding: string): any {
    if (matching.length != 1) return null;
    const firstLabelingTaskType = matching[0].taskType;
    let tmplateKey: InformationSourceExamples;
    let replaceEmbedding = false;
    if (type == InformationSourceType.LABELING_FUNCTION) {
        tmplateKey = firstLabelingTaskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? InformationSourceExamples.LF_EMPTY_EXTRACTION : InformationSourceExamples.LF_EMPTY_CLASSIFICATION;
    }
    else {
        tmplateKey = firstLabelingTaskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? InformationSourceExamples.AL_EMPTY_EXTRACTION : InformationSourceExamples.AL_EMPTY_CLASSIFICATION;
        replaceEmbedding = true;
    }
    const code = InformationSourceCodeLookup.getInformationSourceTemplate(tmplateKey);
    if (replaceEmbedding) {
        code.code = code.code.replace("@@EMBEDDING@@", embedding)
    }
    return code;
}

export function getRouterLinkHeuristic(heuristicType: InformationSourceType, projectId: string, heuristicId: string) {
    let startingLink = '/projects/' + projectId + '/heuristics/' + heuristicId;
    switch (heuristicType) {
        case InformationSourceType.LABELING_FUNCTION:
            startingLink += '/labeling-function';
            break;
        case InformationSourceType.ACTIVE_LEARNING:
            startingLink += '/active-learning';
            break;
        case InformationSourceType.ZERO_SHOT:
            startingLink += '/zero-shot';
            break;
        case InformationSourceType.CROWD_LABELER:
            startingLink += '/crowd-labeler';
            break;
    }
    return startingLink;
}

export function checkSelectedHeuristics(heuristics: Heuristic[], onlyValid: boolean) {
    const selected = heuristics.filter((i) => i.selected).length;
    if (onlyValid) {
        const selectedFinished = heuristics.filter((i) => i.selected && ['FINISHED', 'STARTED'].includes(i?.state)).length;
        return selected > 0 && selected == selectedFinished;
    }
    return selected > 0;
}

export function postProcessCurrentWeakSupervisionRun(currentWeakSupervision: CurrentWeakSupervision): CurrentWeakSupervision {
    const prepareWeakSupervision = jsonCopy(currentWeakSupervision);
    if (currentWeakSupervision.user.firstName) {
        prepareWeakSupervision.displayName = currentWeakSupervision.user.firstName[0] + '. ' + currentWeakSupervision.user.lastName;
    } else {
        prepareWeakSupervision.displayName = UNKNOWN_USER;
    }
    prepareWeakSupervision.createdAtDisplay = parseUTC(currentWeakSupervision.createdAt);
    if (currentWeakSupervision.finishedAt) {
        prepareWeakSupervision.finishedAtDisplay = parseUTC(currentWeakSupervision.finishedAt);
    } else {
        prepareWeakSupervision.finishedAtDisplay = 'Not finished yet';
    }
    return prepareWeakSupervision;
}