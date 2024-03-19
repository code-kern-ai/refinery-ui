import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const organizationEndpoint = `${BACKEND_BASE_URI}/api/v1/organization`;

export function getUserInfo(onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/user-info`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getOverviewStats(onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/overview-stats`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}