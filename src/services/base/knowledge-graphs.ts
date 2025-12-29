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

export function getKnowledgeGraph(knowledgeGraphId: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/${knowledgeGraphId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createKnowledgeGraph(projectId: string, name: string, description: string, type: string, onResult: (result: any) => void) {
    const body = {
        projectId: projectId,
        name: name,
        description: description,
        type: type
    };
    jsonFetchWrapper(knowledgeGraphEndpoint, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}