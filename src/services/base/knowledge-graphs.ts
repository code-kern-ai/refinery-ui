import { BACKEND_BASE_URI } from "./_settings";
import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const knowledgeGraphEndpoint = `${BACKEND_BASE_URI}/api/v1/knowledge-graph`;

export function deleteKnowledgeGraphById(projectId: string, knowledgeGraphId: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/${projectId}`;
    const body = {
        ids: [knowledgeGraphId]
    };
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function getKnowledgeGraphs(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/project/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getKnowledgeGraphsDataStable(projectId: string, searchTerm: string, groupBy: string[], aggregateBy: string[], aggregateFunctions: string[], onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/data/${projectId}`;
    const body = {
        searchTerm: searchTerm,
        groupBy: groupBy,
        aggregateBy: aggregateBy,
        aggregateFunctions: aggregateFunctions
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(body));
}

export function getKnowledgeGraph(knowledgeGraphId: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/${knowledgeGraphId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createKnowledgeGraph(projectId: string, name: string, description: string, type: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/`;
    const body = {
        projectId: projectId,
        name: name,
        description: description,
        type: type
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function updateKnowledgeGraph(projectId: string, knowledgeGraphId: string, name: string, description: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/${knowledgeGraphId}`;
    const body = {
        projectId: projectId,
        name: name,
        description: description
    };
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function executeQuestion(knowledgeGraphId: string, question: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/${knowledgeGraphId}/execute-question`;
    const body = {
        question: question
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}