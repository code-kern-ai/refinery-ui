import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const BASE_URL = `${BACKEND_BASE_URI}/api/v1/embedding`;

export function getEmbeddingPlatforms(onResult: (result: any) => void) {
    const finalUrl = `${BASE_URL}/embedding-platforms`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}


export function getRecommendedEncoders(projectId: string | null, onResult: (result: any) => void) {
    let finalUrl = `${BASE_URL}/recommended-encoders`;
    if (projectId) finalUrl += `?project_id=${projectId}`;

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}