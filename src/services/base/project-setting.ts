import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const projectSettingEndpoint = `${BACKEND_BASE_URI}/api/v1/project-setting`;

export function getQueuedTasks(projectId: string, taskType: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/queued-tasks/${taskType}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getAttributeByAttributeId(projectId: string, attributeId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/${attributeId}/attribute-by-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getCheckRenameLabel(projectId: string, labelId: string, newName: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/check-rename-label/?label_id=${labelId}&new_name=${newName}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getLastRecordExportCredentials(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/last-record-export-credentials`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function prepareRecordExport(projectId: string, options: {
    exportOptions: string, key: string | null
}, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/prepare-record-export`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ options }));
}

export function createLabel(projectId: string, labelName: string, labelingTaskId: string, labelColor: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/create-label`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ labelName, labelingTaskId, labelColor }));
}

export function getRecordByRecordId(projectId: string, recordId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/record-by-record-id?record_id=${recordId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}