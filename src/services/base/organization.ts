import { BACKEND_BASE_URI } from "@/src/services/base/_settings";
export const url = `${BACKEND_BASE_URI}/api/v1/projects/`;

import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";

export function getOverviewStats(onResult: (result: any) => void) {
    const url = `/api/v1/overviewStats`;
    jsonFetchWrapper(url, FetchType.GET, onResult);
}