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