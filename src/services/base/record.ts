

import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const recordEndpoint = `${BACKEND_BASE_URI}/api/v1/record`;

export function syncEditedRecords(projectId: string, changes: string, onResult: (result: any) => void, onError?: (response: any) => void) {
    const finalUrl = `${recordEndpoint}/${projectId}/sync-records`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ changes }), null, onError);
}
