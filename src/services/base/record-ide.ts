import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const recordIdeEndpoint = `${BACKEND_BASE_URI}/api/v1/record-ide`;

export function getRecordIDE(projectId: string, recordId: string, code: string, onResult: (result: any) => void) {
    const finalUrl = `${recordIdeEndpoint}/${projectId}/${recordId}/record-ide`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ code }),);
}
