import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const BASE_URL = `${BACKEND_BASE_URI}/api/v1/organization`;

export function  getOrganization(onResult: (result: any) => void) {
    const finalUrl = `${BASE_URL}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getUserInfo(onResult: (result: any) => void) {
    const finalUrl = `${BASE_URL}/user-info`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getOverviewStats(onResult: (result: any) => void) {
    const finalUrl = `${BASE_URL}/overview-stats`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}


export function getAllActiveAdminMessages(onResult: (result: any) => void) {
    const finalUrl = `${BASE_URL}/all-active-admin-messages`;

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}