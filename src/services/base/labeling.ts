import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { LabelingLinkType } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const labelingEndpoint = `${BACKEND_BASE_URI}/api/v1/labeling`;

export function getAvailableLinks(projectId: string, assumedRole: string, assumedHeuristicId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/available-links`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ assumedRole, assumedHeuristicId }));
}

export function getHuddleData(projectId: string, options: {
    huddleId: string, huddleType: LabelingLinkType
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/huddle-data`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(options));
}

export function getTokenizedRecord(recordId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/tokenized-record`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ recordId }));
}

export function deleteRecordLabelAssociationByIds(projectId: string, recordId: string, associationIds: string[], onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/record-label-association-by-ids`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify({ recordId, associationIds }));
}

export function deleteRecordById(projectId: string, recordId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/${recordId}/record-by-id`;
    return jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function getLinkLocked(projectId: string, linkRoute: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/link-locked`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(linkRoute)));
}

export function generateAccessLink(projectId: string, options: {
    type: string, id: string,
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/generate-access-link`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function removeAccessLink(projectId: string, linkId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/remove-access-link`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify({ "value": linkId }));
}

export function lockAccessLink(projectId: string, options: {
    linkId: string, lockState: boolean
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/lock-access-link`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function addClassificationLabels(projectId: string, recordId: string, labelingTaskId: string, labelId: string, asGoldStar: boolean, sourceId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/add-classification-labels`;
    const body = {
        recordId,
        labelingTaskId,
        labelId,
        asGoldStar,
        sourceId
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function addExtractionLabel(projectId: string, recordId: string, labelingTaskId: string, tokenStartIndex: number, tokenEndIndex: number, value: string, labelId: string, asGoldStar: boolean, sourceId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/add-extraction-label`;
    const body = {
        recordId,
        labelingTaskId,
        tokenStartIndex,
        tokenEndIndex,
        value,
        labelId,
        asGoldStar,
        sourceId
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function setGoldStar(projectId: string, recordId: string, labelingTaskId: string, goldUserId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/set-gold-star`;
    const body = {
        recordId,
        labelingTaskId,
        goldUserId
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function removeGoldStar(projectId: string, recordId: string, labelingTaskId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/remove-gold-star`;
    const body = {
        recordId,
        labelingTaskId
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function updateLabelingTask(projectId: string, options: {
    labelingTaskId: string, labelingTaskName: string, labelingTaskType: string, labelingTaskTargetId: string
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/update-labeling-task`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function deleteLabelingTask(projectId: string, labelingTaskId: string, onResult: (results: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/delete-labeling-task`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(convertCamelToSnakeCase({ "value": labelingTaskId })));
}

export function createLabelingTask(projectId: string, options: {
    labelingTaskName: string, labelingTaskType: string, labelingTaskTargetId: string
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/create-labeling-task`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function deleteLabel(projectId: string, labelId: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/delete-label`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(convertCamelToSnakeCase({ "value": labelId })));
}

export function createLabel(projectId: string, labelName: string, labelingTaskId: string, labelColor: string, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/create-label`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ labelName, labelingTaskId, labelColor }));
}

export function updateLabelColor(projectId: string, options: {
    labelingTaskLabelId: string, labelColor: string
}, onResult: (result: any) => void) {
    const finalUrl = `${labelingEndpoint}/${projectId}/update-label-color`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}