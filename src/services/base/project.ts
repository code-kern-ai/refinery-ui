import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "../../../src/services/base/_settings";

export const projectEndpoint = `${BACKEND_BASE_URI}/api/v1/project`;

export function getProjectByProjectId(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/project-by-project-id/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getAllProjects(userId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/all-projects?userId=${userId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}


export function getGeneralProjectStats(projectId: string, labelingTaskId: string | null, sliceId: string | null, onResult: (result: any) => void) {

    let finalUrl = `${projectEndpoint}/${projectId}/general-project-stats`;

    if (labelingTaskId) {
        finalUrl += `?labelingTaskId=${labelingTaskId}`;
    }
    if (sliceId) {
        finalUrl += labelingTaskId ? '&' : '?';
        finalUrl += `sliceId=${sliceId}`;
    }

    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}