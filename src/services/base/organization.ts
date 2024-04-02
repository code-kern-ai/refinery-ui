import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

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