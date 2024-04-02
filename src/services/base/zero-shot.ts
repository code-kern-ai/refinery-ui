import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

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