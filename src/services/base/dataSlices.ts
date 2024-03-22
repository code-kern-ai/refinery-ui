import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const BASE_URL = `${BACKEND_BASE_URI}/api/v1/data-slice`;

export function getDataSlices(projectId: string, sliceType: string | null, onResult: (result: any) => void) {
    let finalUrl = `${BASE_URL}/${projectId}`;
    if (sliceType) finalUrl += `?slice_type=${sliceType}`;

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getUniqueValuesByAttributes(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${BASE_URL}/${projectId}/unique-values`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}