import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const lookupListsEndpoint = `${BACKEND_BASE_URI}/api/v1/lookup-lists`;

export function getLookupListsByProjectId(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/get-lookup-lists-by-project-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getLookupListsByLookupListId(projectId: string, lookupListId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/${lookupListId}/get-lookup-lists-by-lookup-list-id`;
    return jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getTermsByLookupListId(projectId: string, lookupListId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/${lookupListId}/terms`;
    return jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getExportLookupList(projectId: string, lookupListId: string | string[], onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/${lookupListId}/export`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createKnowledgeBase(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/create-knowledge-base`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}

export function updateKnowledgeBase(projectId: string, options: {
    knowledgeBaseId: string, name: string, description: string
}, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/update-knowledge-base`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}