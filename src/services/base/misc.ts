import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "../../../src/services/base/_settings";

export const miscEndpoint = `${BACKEND_BASE_URI}/api/v1/misc`;

export function getIsAdmin(onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/is-admin`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getVersionOverview(onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/version-overview`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getHasUpdates(onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/has-updates`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}