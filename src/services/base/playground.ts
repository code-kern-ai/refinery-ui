import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const playgroundEndpoint = `${BACKEND_BASE_URI}/api/v1/playground`;

export function getSearchResults(projectId: string, embeddingId: string, question: string, onResult: (result: any) => void) {
    const finalUrl = `${playgroundEndpoint}/${projectId}/question-playground`;
    const body = {
        embeddingId: embeddingId,
        question: question,
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(body));
}
