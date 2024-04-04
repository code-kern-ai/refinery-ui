import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

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

export function getModelCallbacksOverviewData(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/model-callbacks-overview-data`;
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
    const finalUrl = `${heuristicEndpoint}/${projectId}?value=${value}`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}

export function createTask(projectId: string, heuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${heuristicEndpoint}/${projectId}/${heuristicId}/payload`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}