import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const commentEndpoint = `${BACKEND_BASE_URI}/api/v1/comment`;

export function getAllComments(requested: string | null, onResult: (result: any) => void) {
    let finalUrl = `${commentEndpoint}/all-comments`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, requested);
}

export function createComment(options: {
    comment: string,
    xftype: string,
    xfkey: string,
    projectId?: string,
    isPrivate?: boolean
}, onResult: (result: any) => void) {
    let finalUrl = `${commentEndpoint}/create-comment`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}