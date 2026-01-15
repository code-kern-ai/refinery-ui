import { SQLTemplates } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { BACKEND_BASE_URI } from "./_settings";
import { FetchType, jsonFetchWrapper } from "@/submodules/javascript-functions/basic-fetch";
import { convertCamelToSnakeCase } from "@/submodules/javascript-functions/case-types-parser";

export const dataBlocksEndpoint = `${BACKEND_BASE_URI}/api/v1/data-blocks`;

export function deleteDataBlockById(projectId: string, dataBlockId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${projectId}`;
    const body = {
        ids: [dataBlockId]
    };
    jsonFetchWrapper(finalUrl, FetchType.DELETE, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function getDataBlocks(projectId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/project/${projectId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function getDataBlocksDataStable(projectId: string, searchTerm: string, groupBy: string[], aggregateBy: string[], aggregateFunctions: string[], onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/data/${projectId}`;
    const body = {
        searchTerm: searchTerm,
        groupBy: groupBy,
        aggregateBy: aggregateBy,
        aggregateFunctions: aggregateFunctions
    }
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(body));
}

export function getDataBlock(dataBlockId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${dataBlockId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function createDataBlock(projectId: string, name: string, description: string, type: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/`;
    const body = {
        projectId: projectId,
        name: name,
        description: description,
        type: type
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function updateDataBlock(projectId: string, dataBlockId: string, name: string, description: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${dataBlockId}`;
    const body = {
        projectId: projectId,
        name: name,
        description: description,
    };
    jsonFetchWrapper(finalUrl, FetchType.PUT, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function executeDataBlockQuery(dataBlockId: string, sqlTemplate: string, sqlTemplateState: object, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/query/${dataBlockId}`;
    const body = {
        sqlConfig: {
            template: sqlTemplate,
            config: sqlTemplateState
        },
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function createDataBlockColumn(dataBlockId: string, name: string, dataType: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${dataBlockId}/attributes`;
    const body = {
        name: name,
        dataType: dataType,
        userCreated: true,
    };
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(convertCamelToSnakeCase(body)));
}

export function getDataBlockColumnByColumnId(dataBlockId: string, dataBlockColumnId: string, onResult: (result: any) => void) {
    const finalUrl = `${dataBlocksEndpoint}/${dataBlockId}/attributes/${dataBlockColumnId}`;
    jsonFetchWrapper(finalUrl, FetchType.GET, onResult);
}

export function updateDataBlockColumn(dataBlockId: string, dataBlockColumnId: string, onResult: (result: any) => void, dataType?: string, isPrimaryKey?: boolean, name?: string, sourceCode?: string, additionalConfig?: any) {
    const finalUrl = `${dataBlocksEndpoint}/${dataBlockId}/attributes/${dataBlockColumnId}`;
    const baseData: any = convertCamelToSnakeCase({ dataType, isPrimaryKey, name, sourceCode });
    baseData.additional_config = additionalConfig;
    jsonFetchWrapper(finalUrl, FetchType.POST, onResult, JSON.stringify(baseData));
}