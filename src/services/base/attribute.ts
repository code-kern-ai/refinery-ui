import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const attributeEndpoint = `${BACKEND_BASE_URI}/api/v1/attribute`;

export function getAttributes(projectId: string, stateFilter: string[], onResult: (result: any) => void) {
    const stateFilterQuery = new URLSearchParams()
    stateFilter.forEach(filter => stateFilterQuery.append("state_filter", filter));
    const finalUrl = `${attributeEndpoint}/${projectId}/all-attributes?${stateFilterQuery}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}