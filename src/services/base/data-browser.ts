import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

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

export function createDataSlice(projectId: string, options: {
    name: string, static: boolean, filterRaw: string, filterData: string[]
}, onResult: (result: any) => void) {
    const finalUrl = `${dataBrowserEndpoint}/${projectId}/create-data-slice`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ options }));
}

export function getRecordsBySimilarity(projectId: string, embeddingId: string, recordId: string, attFilter: string, recordSubKey: number, onResult: (result: any) => void) {
    const finalUrl = `${dataBrowserEndpoint}/${projectId}/search-records-by-similarity`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ embeddingId, recordId, attFilter, recordSubKey }));
}

export function updateDataSlice(projectId: string, options: {
    dataSliceId: string, static: boolean, filterRaw: string, filterData: string[]
}, onResult: (result: any) => void) {
    const finalUrl = `${dataBrowserEndpoint}/${projectId}/update-data-slice`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}