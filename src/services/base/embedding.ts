import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const embeddingEndpoint = `${BACKEND_BASE_URI}/api/v1/embedding`;

export function getEmbeddingPlatforms(onResult: (result: any) => void) {
    const finalUrl = `${embeddingEndpoint}/embedding-platforms`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getRecommendedEncoders(projectId: string | null, onResult: (result: any) => void) {
    let finalUrl = `${embeddingEndpoint}/recommended-encoders`;
    if (projectId) finalUrl += `?project_id=${projectId}`;

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getAllTokenizerOptions(onResult: (result: any) => void) {
    const finalUrl = `${embeddingEndpoint}/language-models`;

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getEmbeddings(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${embeddingEndpoint}/embeddings-by-project?project_id=${projectId}`;

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function deleteFromTaskQueue(projectId: string, taskId: string, onResult: (result: any) => void) {
    const finalUrl = `${embeddingEndpoint}/${projectId}/${taskId}/delete-from-task-queue`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function deleteEmbeddingPost(projectId: string, embeddingId: string, onResult: (result: any) => void) {
    const finalUrl = `${embeddingEndpoint}/${projectId}/${embeddingId}/delete-embedding`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function createEmbeddingPost(projectId: string, attributeId: string, config: string, onResult: (result: any) => void) {
    const finalUrl = `${embeddingEndpoint}/${projectId}/create-embedding`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase({ attributeId, config })));
}

export function updateEmbeddingPayload(projectId: string, options: {
    embeddingId: string, filterAttributes: any
}, onResult: (result: any) => void) {
    const finalUrl = `${embeddingEndpoint}/${projectId}/update-embedding-payload`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}