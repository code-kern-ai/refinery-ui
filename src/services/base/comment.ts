import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const commentEndpoint = `${BACKEND_BASE_URI}/api/v1/comment`;

export function getAllComments(requested: string | null, onResult: (result: any) => void) {
    let finalUrl = `${commentEndpoint}/all-comments`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, requested);
}