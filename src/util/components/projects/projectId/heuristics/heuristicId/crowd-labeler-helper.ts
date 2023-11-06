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

export function parseLinkFromText(link: string) {
    if (!link) return null;
    let linkData: any = {
        protocol: window.location.protocol,
        host: window.location.host,
        inputLink: "" + link,
        queryParams: {}
    }
    if (link.startsWith(linkData.protocol)) link = link.substring(linkData.protocol.length);
    if (link.startsWith("//")) link = link.substring(2);
    if (link.startsWith(linkData.host)) link = link.substring(linkData.host.length);
    if (link.startsWith("/refinery")) link = link.substring(9);
    if (link.indexOf("?") > -1) {
        let params = link.split("?");
        linkData.route = params[0];
        params = params[1].split("&");
        params.forEach(param => {
            let keyValue = param.split("=");
            linkData.queryParams[keyValue[0]] = keyValue[1];
        })
    } else {
        linkData.route = link;
    }

    linkData.fullUrl = linkData.protocol + '//' + linkData.host + "/refinery" + linkData.route;
    if (linkData.queryParams) linkData.fullUrl += "?" + Object.keys(linkData.queryParams).map(key => key + "=" + linkData.queryParams[key]).join("&");


    return linkData;
}
