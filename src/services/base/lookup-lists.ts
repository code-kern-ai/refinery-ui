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

export function deleteKnowledgeBase(projectId: string, knowledgeBaseId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/delete-knowledge-base/${knowledgeBaseId}`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function updateKnowledgeBase(projectId: string, options: {
    knowledgeBaseId: string, name: string, description: string
}, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/update-knowledge-base`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function addTermToKnowledgeBase(projectId: string, options: {
    value: string, comment: string, knowledgeBaseId: string | string[]
}, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/add-term-to-knowledge-base`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function deleteTerm(projectId: string, termId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/delete-term/${termId}`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}