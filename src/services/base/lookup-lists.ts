import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const lookupListsEndpoint = `${BACKEND_BASE_URI}/api/v1/lookup-lists`;

export function getLookupListsByProjectId(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/lookup-lists/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getLookupListsByLookupListId(projectId: string, lookupListId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/lookup-lists/${projectId}/${lookupListId}`;
    return jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getTermsByLookupListId(projectId: string, lookupListId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/lookup-lists/${projectId}/${lookupListId}/terms`;
    return jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getExportLookupList(projectId: string, lookupListId: string | string[], onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/lookup-lists/${projectId}/${lookupListId}/export`;
    console.log("REACHED getExportLookupList")
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createKnowledgeBase(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${lookupListsEndpoint}/${projectId}/knowledge-base`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult);
}