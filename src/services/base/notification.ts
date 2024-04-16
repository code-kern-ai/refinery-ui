import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const notificationEndpoint = `${BACKEND_BASE_URI}/api/v1/notification`;

export function getNotificationsByUser(onResult: (result: any) => void) {
    const finalUrl = `${notificationEndpoint}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getNotifications(options: {
    projectFilter: string[],
    levelFilter: string[],
    typeFilter: string[],
    userFilter: boolean,
    limit: number,
}, onResult: (result: any) => void) {
    const finalUrl = `${notificationEndpoint}/notifications`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}
