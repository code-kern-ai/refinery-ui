import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const BASE_URL = `${BACKEND_BASE_URI}/api/v1/heuristics`;

export function getWeakSupervisionRun(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${BASE_URL}/weak-supervision-run/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}