import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "../../../src/services/base/_settings";

export const miscEndpoint = `${BACKEND_BASE_URI}/api/v1/misc`;

export function getIsAdmin(onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/is-admin`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}