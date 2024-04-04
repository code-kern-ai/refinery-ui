import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const weakSupervisionEndpoint = `${BACKEND_BASE_URI}/api/v1/weak-supervision`;

export function initWeakSupervision(projectId: string, onResult: (result: any) => void, overwrite_default_precision?: number, overwrite_weak_supervision?: { [key: string]: number }) {
    const finalUrl = `${weakSupervisionEndpoint}/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({
        overwrite_default_precision,
        overwrite_weak_supervision
    }));
}
