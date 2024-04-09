import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { UploadType } from "@/src/types/shared/upload";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

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

export function getRatsTokenization(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/rats-running`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getAccessTokens(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/access-tokens`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getLastProjectExportCredentials(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/last-export-credentials`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getUploadCredentialsAndId(projectId: string, fileName: string, fileType: string, fileImportOptions: string, uploadType: UploadType, key: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/upload-credentials-and-id`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ file_name: fileName, file_type: fileType, file_import_options: fileImportOptions, upload_type: uploadType, key }));
}

export function getNotifications(options: {
    projectFilter: string[],
    levelFilter: string[],
    typeFilter: string[],
    userFilter: boolean,
    limit: number,
}, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/notifications`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function getUploadTaskById(projectId: string, uploadTaskId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/upload-task-by-id?upload_task_id=${uploadTaskId}`;
    return jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createPersonalToken(projectId: string, name: string, expiresAt: string, scope: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/create-personal-token`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase({ name, expiresAt, scope })));
}

export function deletePersonalToken(projectId: string, tokenId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/${tokenId}/delete-personal-token`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function updateProjectNameAndDescriptionPost(projectId: string, name: string, description: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/update-project-name-description`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ name, description }));
}

export function deleteProject(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/delete-project`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function createProject(options: {
    name: string, description: string
}, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/create-project`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function updateProjectTokenizer(projectId: string, options: {
    tokenizer: string
}, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/update-project-tokenizer`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}

export function updateProjectStatus(projectId: string, options: {
    newStatus: string
}, onResult: (result: any) => void) {
    const finalUrl = `${projectEndpoint}/${projectId}/update-project-status`;
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(options)));
}