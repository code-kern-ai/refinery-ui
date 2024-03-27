import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const labelingEndpoint = `${BACKEND_BASE_URI}/api/v1/labeling`;

export function getAvailableLinks(projectId: string, assumedRole: string, assumedHeuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/available-links`;
    console.log(JSON.stringify({ assumedRole, assumedHeuristicId }))
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ assumedRole, assumedHeuristicId }));
}