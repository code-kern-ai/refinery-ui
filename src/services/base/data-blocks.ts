import { SQLTemplates } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { BACKEND_BASE_URI } from "./_settings";
import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const dataBlocksEndpoint = `${BACKEND_BASE_URI}/api/v1/data-blocks`;

export function deleteDataBlockByIds(projectId: string, dataBlockIds: string[], onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify({ ids: dataBlockIds }));
}

export function getDataBlocks(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/project/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getDataBlock(projectId: string, dataBlockId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/single/${projectId}/${dataBlockId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createDataBlock(projectId: string, name: string, description: string, type: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}`;
    const body = {
        name: name,
        description: description,
        type: type
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function updateDataBlock(projectId: string, dataBlockId: string, name: string, description: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/project/${projectId}/${dataBlockId}`;
    const body = {
        name: name,
        description: description,
    };
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function executeDataBlockQuery(projectId: string, dataBlockId: string, sqlTemplate: string, sqlTemplateState: object, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/query/${projectId}/${dataBlockId}`;
    const body = {
        sqlConfig: {
            template: sqlTemplate,
            config: sqlTemplateState
        },
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function createDataBlockColumn(projectId: string, dataBlockId: string, name: string, dataType: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}/${dataBlockId}/attributes`;
    const body = {
        name: name,
        dataType: dataType,
        userCreated: true,
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function getDataBlockColumnByColumnId(projectId: string, dataBlockId: string, dataBlockColumnId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}/${dataBlockId}/attributes/${dataBlockColumnId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function updateDataBlockColumn(projectId: string, dataBlockId: string, dataBlockColumnId: string, onResult: (result: any) => void, dataType?: string, isPrimaryKey?: boolean, name?: string, sourceCode?: string, additionalConfig?: any) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}/${dataBlockId}/attributes/${dataBlockColumnId}`;
    const baseData: any = convertCamelToSnakeCase({ dataType, isPrimaryKey, name, sourceCode });
    baseData.additional_config = additionalConfig; //assigned directly to prevent the conversion of sub dict values
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(baseData));
}

export function deleteDataBlockColumnById(projectId: string, dataBlockId: string, dataBlockColumnId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}/${dataBlockId}/attributes/${dataBlockColumnId}`;
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult);
}

export function runDataBlockColumnLlmPlayground(projectId: string, dataBlockId: string, dataBlockColumnId: string, recordIds: string[], llmConfig: any, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}/${dataBlockId}/attributes/${dataBlockColumnId}/run-llm-playground`;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify({ record_ids: recordIds, llm_config: llmConfig }));
}

export function getRecordByRecordIdDataBlockColumn(projectId: string, dataBlockId: string, recordId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}/${dataBlockId}/record-by-record-id?record_id=${recordId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getSampleRecordsDataBlockColumn(projectId: string, dataBlockId: string, dataBlockColumnId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}/${dataBlockId}/attributes/${dataBlockColumnId}/sample-records`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}