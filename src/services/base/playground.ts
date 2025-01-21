import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const playgroundEndpoint = `${BACKEND_BASE_URI}/api/v1/playground`;

export function getSearchResults(projectId: string, embeddingId: string, question: string, limit: number, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/search`;
    const body = {
        embeddingId: embeddingId,
        question: question,
        limit: limit,
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(body));
}


export function createEvaluationSet(projectId: string, question: string, recordIds: string[], onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-sets`;
    const body = {
        question: question,
        recordIds: recordIds
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(body));
}

export function deleteEvaluationSetsPost(projectId: string, evaluationSetIds: string[], onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-sets`;
    const body = {
        evaluationSetIds: evaluationSetIds
    }
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(body));
}

export function getEvaluationSets(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-sets`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getEvaluationSetsByGroupId(projectId: string, evaluationGroupId: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-sets-by-group/${evaluationGroupId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getEvaluationSetById(projectId: string, evaluationSetId: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-sets/${evaluationSetId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createEvaluationGroups(projectId: string, evaluationSetIds: string[], name: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-groups`;
    const body = {
        evaluationSetIds: evaluationSetIds,
        name: name
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(body));
}

export function deleteEvaluationGroupsPost(projectId: string, evaluationGroupIds: string[], onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-groups`;
    const body = {
        evaluationGroupIds: evaluationGroupIds
    }
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(body));
}

export function getEvaluationGroups(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-groups`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getEvaluationGroupById(projectId: string, groupId: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-groups/${groupId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function recordSearchContains(projectId: string, query: string, offset: number, limit: number, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/record-search-contains`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ query, limit, offset }));
}

export function getEvaluationRuns(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-runs`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createEvaluationRun(projectId, embeddingId: string, evaluationGroupId: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-runs`;
    const body = {
        embeddingId: embeddingId,
        evaluationGroupId: evaluationGroupId
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(body));
}

export function getEvaluationRunById(projectId: string, evaluationRunId: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/evaluation-runs/${evaluationRunId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}