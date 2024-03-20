import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const embeddingEndpoint = `${BACKEND_BASE_URI}/api/v1/embedding`;

export function getEmbeddingPlatforms(onResult: (result: any) => void) {
    const finalUrl = `${embeddingEndpoint}/embedding-platforms`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}