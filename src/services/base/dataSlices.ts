import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const dataSliceEndpoint = `${BACKEND_BASE_URI}/api/v1/data-slice`;

export function getDataSlices(projectId: string, sliceType: string | null, onResult: (result: any) => void) {
    let finalUrl = `${dataSliceEndpoint}/${projectId}/get-data-slices`;
    if (sliceType) finalUrl += `?slice_type=${sliceType}`;

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getUniqueValuesByAttributes(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataSliceEndpoint}/${projectId}/unique-values`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function staticDataSlicesCurrentCount(projectId: string, sliceId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataSliceEndpoint}/${projectId}/static-data-slices-current-count/${sliceId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function deleteDataSliceById(projectId: string, dataSliceId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataSliceEndpoint}/${projectId}/${dataSliceId}`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}