import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const miscEndpoint = `${BACKEND_BASE_URI}/api/v1/misc`;

export function getIsAdmin(onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/is-admin`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getVersionOverview(onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/version-overview`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getHasUpdates(onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/has-updates`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function modelProviderDeleteModel(modelName: string, onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/model-provider-delete-model`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(convertCamelToSnakeCase({ modelName })));
}

export function modelProviderDownloadModel(modelName: string, onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/model-provider-download-model`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase({ modelName })));
}