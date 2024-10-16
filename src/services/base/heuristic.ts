import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const heuristicEndpoint = `${BACKEND_BASE_URI}/api/v1/heuristic`;

export function getInformationSourcesOverviewData(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/information-sources-overview-data`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getWeakSupervisionRun(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/weak-supervision-run`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getHeuristicByHeuristicId(projectId: string, heuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/${heuristicId}/heuristic-by-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getPayloadByPayloadId(projectId: string, payloadId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/${payloadId}/payload-by-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getLabelingFunctionOn10Records(projectId: string, heuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/${heuristicId}/lf-on-10-records`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getAccessLink(projectId: string, linkId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/access-link?link_id=${linkId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function toggleHeuristicById(projectId: string, heuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/${heuristicId}/toggle-heuristic`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}

export function setAllHeuristics(projectId: string, value: boolean, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/change-selection-state?value=${value}`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}

export function createTask(projectId: string, heuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/${heuristicId}/payload`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}

export function deleteHeuristicById(projectId: string, heuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/${heuristicId}/delete-heuristic`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function createHeuristicPost(projectId: string, labelingTaskId: string, sourceCode: string, name: string, description: string, type: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/create-heuristic`;
    const body = {
        labelingTaskId: labelingTaskId,
        sourceCode: sourceCode,
        name: name,
        description: description,
        type: type
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function updateHeuristicPost(projectId: string, heuristicId: string, labelingTaskId: string, code: string, description: string, name: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/${heuristicId}/update-heuristic`;
    const body = {
        labelingTaskId: labelingTaskId,
        code: code,
        description: description,
        name: name
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}