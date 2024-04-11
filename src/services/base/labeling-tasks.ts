import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";
import { BACKEND_BASE_URI } from "./_settings";

export const labelingEndpoint = `${BACKEND_BASE_URI}/api/v1/labeling-tasks`;

export function updateLabelingTask(projectId: string, options: {
    labelingTaskId: string, labelingTaskName: string, labelingTaskType: string, labelingTaskTargetId: string
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/update-labeling-task`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function deleteLabelingTaskPost(projectId: string, labelingTaskId: string, onResult: (results: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/delete-labeling-task`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(convertCamelToSnakeCase({ "value": labelingTaskId })));
}

export function createLabelingTask(projectId: string, options: {
    labelingTaskName: string, labelingTaskType: string, labelingTaskTargetId: string
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/create-labeling-task`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function deleteLabelPost(projectId: string, labelId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/delete-label`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(convertCamelToSnakeCase({ "value": labelId })));
}

export function createLabel(projectId: string, labelName: string, labelingTaskId: string, labelColor: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/create-label`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ labelName, labelingTaskId, labelColor }));
}

export function updateLabelColorPost(projectId: string, options: {
    labelingTaskLabelId: string, labelColor: string
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/update-label-color`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function updateLabelHotkey(projectId: string, options: {
    labelingTaskLabelId: string, labelHotkey: string
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/update-label-hotkey`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function handleLabelRenameWarnings(projectId: string, options: {
    warningData: any
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/handle-label-rename-warnings`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function updateLabelName(projectId: string, options: {
    labelId: string, newName: string
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/update-label-name`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}