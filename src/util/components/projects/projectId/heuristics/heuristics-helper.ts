import { CurrentWeakSupervision, Heuristic } from "@/src/types/components/projects/projectId/heuristics/heuristics";
import { InformationSourceType, LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { InformationSourceCodeLookup, InformationSourceExamples } from "@/src/util/classes/heuristics";
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { UNKNOWN_USER } from "@/src/util/constants";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { getColorStruct, mapInformationSourceStatsGlobal } from "./shared-helper";

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
    let templateKey: InformationSourceExamples;
    let replaceEmbedding = false;
    if (type == InformationSourceType.LABELING_FUNCTION) {
        templateKey = firstLabelingTaskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? InformationSourceExamples.LF_EMPTY_EXTRACTION : InformationSourceExamples.LF_EMPTY_CLASSIFICATION;
    }
    else {
        templateKey = firstLabelingTaskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? InformationSourceExamples.AL_EMPTY_EXTRACTION : InformationSourceExamples.AL_EMPTY_CLASSIFICATION;
        replaceEmbedding = true;
    }
    const code = InformationSourceCodeLookup.getInformationSourceTemplate(templateKey);
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
    if (!currentWeakSupervision) return null;
    const prepareWeakSupervision = { ...currentWeakSupervision };
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