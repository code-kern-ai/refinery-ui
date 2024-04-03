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