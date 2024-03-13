import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "../../../src/services/base/_settings";

// export const url = `${BACKEND_BASE_URI}/api/v1/organization`;
export const url = `/api/v1/organization`;


export function getOverviewStats(onResult: (result: any) => void) {
    const finalUrl = `${url}/overview-stats`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getIsDemo(onResult: (result: any) => void) {
    const url = `/is_demo`;
    jsonFetchWrapper(url, FetchType.GET, onResult);
}