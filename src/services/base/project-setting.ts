import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "../../../src/services/base/_settings";

export const projectSettingEndpoint = `${BACKEND_BASE_URI}/api/v1/project-setting`;

export function getQueuedTasks(projectId: string, taskType: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/queued-tasks/${taskType}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getAttributeByAttributeId(projectId: string, attributeId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/${attributeId}/attribute-by-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}