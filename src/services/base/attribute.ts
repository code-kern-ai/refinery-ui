import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const attributeEndpoint = `${BACKEND_BASE_URI}/api/v1/attribute`;

export function getAttributes(projectId: string, stateFilter: string[], onResult: (result: any) => void) {
    const stateFilterQuery = new URLSearchParams()
    stateFilter.forEach(filter => stateFilterQuery.append("state_filter", filter));
    const finalUrl = `${attributeEndpoint}/${projectId}/all-attributes?${stateFilterQuery}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getCheckCompositeKey(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${attributeEndpoint}/${projectId}/check-composite-key`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getSampleRecords(projectId: string, attributeId: string, onResult: (result: any) => void) {
    const finalUrl = `${attributeEndpoint}/${projectId}/${attributeId}/sample-records`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function deleteUserAttribute(projectId: string, options: {
    attributeId: string
}, onResult: (result: any) => void) {
    const finalUrl = `${attributeEndpoint}/${projectId}/delete-user-attribute`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}