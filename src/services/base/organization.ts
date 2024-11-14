import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const organizationEndpoint = `${BACKEND_BASE_URI}/api/v1/organization`;

export function getOrganization(onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getOrganizationUsers(onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/all-users`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getUserInfo(onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/user-info`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getOverviewStats(onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/overview-stats`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getAllActiveAdminMessages(onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/all-active-admin-messages`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}


export function changeOrganization(orgId: string, changes: string, onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/change-organization`;
    const body = { orgId, changes };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function updateConfig(dictStr: string, onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/update-config`;
    const body = { dictStr };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}