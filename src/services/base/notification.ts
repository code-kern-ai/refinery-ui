import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const notificationEndpoint = `${BACKEND_BASE_URI}/api/v1/notification`;

export function getNotificationsByUser(onResult: (result: any) => void) {
    const finalUrl = `${notificationEndpoint}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}