import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const dataBrowserEndpoint = `${BACKEND_BASE_URI}/api/v1/data-browser`;

export function getRecordComments(projectId: string, recordIds: string[], onResult: (result: any) => void) {
    const finalUrl = `${dataBrowserEndpoint}/${projectId}/record-comments`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ recordIds: recordIds }));
}

export function searchRecordsExtended(projectId: string, filterData: string[], offset: number, limit: number, onResult: (result: any) => void) {
    const finalUrl = `${dataBrowserEndpoint}/${projectId}/search-records-extended`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ filterData: filterData, offset: offset, limit: limit }));
}

export function createOutlierSlice(projectId: string, embeddingId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBrowserEndpoint}/${projectId}/create-outlier-slice/${embeddingId}`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}

export function getRecordsByStaticSlice(projectId: string,
    sliceId: string, options: {
        orderBy?: string,
        offset?: number,
        limit?: number,
    }, onResult: (result: any) => void) {
    const finalUrl = `${dataBrowserEndpoint}/${projectId}/records-by-static-slice/${sliceId}`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ options }));
}