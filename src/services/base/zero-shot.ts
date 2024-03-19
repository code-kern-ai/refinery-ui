import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const zeroShotEndpoint = `${BACKEND_BASE_URI}/api/v1/zero-shot`;

export function getZeroShotRecommendations(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${zeroShotEndpoint}/zero-shot-recommendations/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}


