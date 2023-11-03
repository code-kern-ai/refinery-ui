import { CrowdLabelerHeuristicSettings } from "@/src/types/components/projects/projectId/heuristics/heuristicId/crowd-labeler";
import { Heuristic } from "@/src/types/components/projects/projectId/heuristics/heuristics";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { InformationSourceType, LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { getColorStruct, mapInformationSourceStats } from "../shared-helper";

export function postProcessCrowdLabeler(heuristic: Heuristic, labelingTasks: LabelingTask[]): Heuristic {
    const prepareHeuristic = jsonCopy(heuristic);
    prepareHeuristic.labelSource = LabelSource.INFORMATION_SOURCE;
    prepareHeuristic.informationSourceType = InformationSourceType[heuristic['type']];
    prepareHeuristic.selected = heuristic['isSelected'];
    prepareHeuristic.stats = mapInformationSourceStats(heuristic['sourceStatistics']['edges']);
    const labelingTask = labelingTasks.find(a => a.id == heuristic.labelingTaskId);
    prepareHeuristic.labelingTaskName = labelingTask.name;
    prepareHeuristic.stats.forEach((stat) => {
        stat.color = getColorStruct(stat.color);
    });
    prepareHeuristic.labels = labelingTask.labels;
    prepareHeuristic.crowdLabelerSettings = parseCrowdSettings(prepareHeuristic.sourceCode);
    return prepareHeuristic;
}

export function parseCrowdSettings(settingsJson: string): CrowdLabelerHeuristicSettings {
    const tmp = JSON.parse(settingsJson);
    return {
        dataSliceId: tmp.data_slice_id ?? null,
        annotatorId: tmp.annotator_id ?? null,
        accessLinkId: tmp.access_link_id ?? null
    }
}

export function parseToSettingsJson(settings: CrowdLabelerHeuristicSettings): string {
    const tmp = {
        data_slice_id: settings.dataSliceId,
        annotator_id: settings.annotatorId,
        access_link_id: settings.accessLinkId
    }
    return JSON.stringify(tmp);
}


export function buildFullLink(route: string) {
    return window.location.protocol + '//' + window.location.host + "/refinery" + route;
}