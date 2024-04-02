import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";

export const projectEndpoint = `${BACKEND_BASE_URI}/api/v1/project`;

export function getProjectByProjectId(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/project-by-project-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}


export function getAllProjects(onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/all-projects`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getGeneralProjectStats(projectId: string, labelingTaskId: string | null, sliceId: string | null, onResult: (result: any) => void) {

    let finalUrl = `${projectEndpoint}/${projectId}/general-project-stats`;

    if (labelingTaskId) {
        finalUrl += `?labeling_task_id=${labelingTaskId}`;
    }
    if (sliceId) {
        finalUrl += labelingTaskId ? '&' : '?';
        finalUrl += `slice_id=${sliceId}`;
    }

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getInterAnnotatorMatrix(projectId: string, labelingTaskId: string | null, sliceId: string | null, includeGoldStar: boolean | null, includeAllOrgUser: boolean | null, onResult: (result: any) => void) {

    let finalUrl = `${projectEndpoint}/${projectId}/inter-annotator-matrix`;
    let somethingAdded = false;

    if (labelingTaskId) {
        finalUrl += somethingAdded ? '&' : '?';
        finalUrl += "labeling_task_id=" + labelingTaskId;
        somethingAdded = true;
    }
    if (sliceId) {
        finalUrl += somethingAdded ? '&' : '?';
        finalUrl += "only_on_static_slice=" + sliceId;
        somethingAdded = true;
    }
    if (includeGoldStar) {
        finalUrl += somethingAdded ? '&' : '?';
        finalUrl += "include_gold_star=" + includeGoldStar;
        somethingAdded = true;
    }
    if (includeAllOrgUser) {
        finalUrl += somethingAdded ? '&' : '?';
        finalUrl += "include_all_org_user=" + includeAllOrgUser;
        somethingAdded = true;
    }
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getConfusionMatrix(projectId: string, labelingTaskId: string | null, sliceId: string | null, onResult: (result: any) => void) {

    let finalUrl = `${projectEndpoint}/${projectId}/confusion-matrix`;

    if (labelingTaskId) {
        finalUrl += `?labeling_task_id=${labelingTaskId}`;
    }
    if (sliceId) {
        finalUrl += labelingTaskId ? '&' : '?';
        finalUrl += `slice_id=${sliceId}`;
    }

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getConfidenceDistribution(projectId: string, labelingTaskId: string | null, sliceId: string | null, onResult: (result: any) => void) {

    let finalUrl = `${projectEndpoint}/${projectId}/confidence-distribution`;

    if (labelingTaskId) {
        finalUrl += `?labeling_task_id=${labelingTaskId}`;
    }
    if (sliceId) {
        finalUrl += labelingTaskId ? '&' : '?';
        finalUrl += `slice_id=${sliceId}`;
    }

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getLabelDistribution(projectId: string, labelingTaskId: string | null, sliceId: string | null, onResult: (result: any) => void) {

    let finalUrl = `${projectEndpoint}/${projectId}/label-distribution`;

    if (labelingTaskId) {
        finalUrl += `?labeling_task_id=${labelingTaskId}`;
    }
    if (sliceId) {
        finalUrl += labelingTaskId ? '&' : '?';
        finalUrl += `slice_id=${sliceId}`;
    }

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getGatesIntegrationData(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/gates-integration-data`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getProjectTokenization(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/project-tokenization`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}
export function getLabelingTasksByProjectId(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/labeling-tasks-by-project-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getModelProviderInfo(onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/model-provider-info`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getRecordExportFromData(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/record-export-by-project-id`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}