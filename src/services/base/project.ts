import { FetchType, jsonFetchWrapper } from "../../../submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "../../../src/services/base/_settings";

export const url = `${BACKEND_BASE_URI}/api/v1/project`;
// export const url = `http://localhost:7051/api/v1/project`;

export function getProjectByProjectId(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${url}/project-by-project-id/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}