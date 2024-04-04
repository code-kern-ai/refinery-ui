import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const zeroShotEndpoint = `${BACKEND_BASE_URI}/api/v1/zero-shot`;

export function getZeroShotRecommendations(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${zeroShotEndpoint}/${projectId}/zero-shot-recommendations`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getZeroShotText(projectId: string, heuristicId: string, config: string, text: string, runIndividually: boolean, labelNames: string[], onResult: (result: any) => void) {
    const finalUrl = `${zeroShotEndpoint}/${projectId}/zero-shot-text`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ heuristicId, config, text, runIndividually, labelNames }));
}

export function getZeroShot10Records(projectId: string, heuristicId: string, labelNames: string[], onResult: (result: any) => void) {
    const finalUrl = `${zeroShotEndpoint}/${projectId}/zero-shot-10-records`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ heuristicId, labelNames }));
}

export function initZeroShot(projectId: string, heuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${zeroShotEndpoint}/${projectId}/${heuristicId}/run-zero-shot`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}

export function createZeroShotPost(projectId: string, targetConfig: string, labelingTaskId: string, attributeId: string, onResult: (result: any) => void) {
    const finalUrl = `${zeroShotEndpoint}/${projectId}/create-zero-shot`;
    const body = {
        targetConfig: targetConfig,
        labelingTaskId: labelingTaskId,
        attributeId: attributeId
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function cancelZeroShot(projectId: string, heuristicId: string, payloadId: string, onResult: (result: any) => void) {
    const finalUrl = `${zeroShotEndpoint}/${projectId}/cancel-zero-shot`;
    const body = {
        heuristicId: heuristicId,
        payloadId: payloadId
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}