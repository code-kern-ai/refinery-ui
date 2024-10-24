import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const projectSettingEndpoint = `${BACKEND_BASE_URI}/api/v1/project-setting`;

export function getQueuedTasks(projectId: string, taskType: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/queued-tasks/${taskType}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getAttributeByAttributeId(projectId: string, attributeId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/${attributeId}/attribute-by-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function prepareProjectExport(projectId: string, options: {
    exportOptions: string, key: string | null
}, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/prepare-project-export`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function getCheckRenameLabel(projectId: string, labelId: string, newName: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/check-rename-label?label_id=${labelId}&new_name=${newName}`;
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
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ "export_options": options.exportOptions, "key": options.key }));
}

export function getRecordByRecordId(projectId: string, recordId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/record-by-record-id?record_id=${recordId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getProjectSize(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/project-size`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createLabels(projectId: string, labelingTaskId: string, labels: string[], onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/create-labels`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ labelingTaskId, labels }));
}

export function createAttribute(projectId: string, name: string, dataType: string, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/create-attribute`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase({ name, dataType })));
}

export function updateAttribute(projectId: string, attributeId: string, onResult: (result: any) => void, dataType?: string, isPrimaryKey?: boolean, name?: string, sourceCode?: string, visibility?: string) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/update-attribute`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase({ attributeId, dataType, isPrimaryKey, name, sourceCode, visibility })));
}

export function calculateUserAttributeAllRecordsPost(projectId: string, options: {
    attributeId: string
}, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/calculate-user-attribute-all-records`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function createTaskAndLabels(projectId: string, options: {
    labelingTaskName: string, labelingTaskType: string, labelingTaskTargetId: string, labels: string[]
}, onResult: (result: any) => void) {
    const finalUrl = `${projectSettingEndpoint}/${projectId}/create-task-and-labels`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}