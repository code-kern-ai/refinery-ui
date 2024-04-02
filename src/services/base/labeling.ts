import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { LabelingLinkType } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";

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