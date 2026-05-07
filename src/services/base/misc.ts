import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { BACKEND_BASE_URI } from "./_settings";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const miscEndpoint = `${BACKEND_BASE_URI}/api/v1/misc`;

export function getIsAdmin(onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/is-admin`;
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

export function validateSQLClauses(sqlClauses: { select: string, where: string, groupBy: string, having: string, orderBy: string, limit: number }, onResult: (result: any) => void) {
    const finalUrl = `${miscEndpoint}/test-where-clause`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(sqlClauses));
}   
