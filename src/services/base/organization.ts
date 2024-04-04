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

export function getAllUsersWithRecordCount(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/${projectId}/all-users-with-record-count`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getCanCreateLocalOrg(onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/can-create-local-org`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createOrganization(name: string, onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/create-organization`;
    const body = { name };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(body));
}

export function addUserToOrganization(userMail: string, organizationName: string, onResult: (result: any) => void) {
    const finalUrl = `${organizationEndpoint}/add-user-to-organization`;
    const body = { userMail, organizationName };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
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