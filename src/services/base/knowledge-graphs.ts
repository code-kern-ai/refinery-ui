import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const knowledgeGraphEndpoint = `${BACKEND_BASE_URI}/api/v1/knowledge-graph`;

export function deleteKnowledgeGraphById(projectId: string, knowledgeGraphId: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/${projectId}/${knowledgeGraphId}/delete-knowledge-graph`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function getKnowledgeGraphs(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${knowledgeGraphEndpoint}/${projectId}/knowledge-graphs`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}
