import { DataBlockColumn, DataBlockColumnState, DataBlockColumnType, SQLTemplates } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { DataBlocksColumnsExamples, DataBlocksColumnsCodeLookup } from "@/src/util/classes/data-blocks-columns";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { parseContainerLogsData } from "@/submodules/javascript-functions/logs-parser";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";

export const getSQLTemplatesDict = (projectId: string) => {
    return {
        [SQLTemplates.BLANK_QUERY]: {
            selectClause: 'SELECT ',
            from_clause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY ',
            orderByClause: 'ORDER BY ',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.INTEGRATION_AUDIT]: {
            selectClause: 'SELECT ((data->>\'metadata\')::json)->>\'sharepoint_created_by\' as created_by, ((data->>\'metadata\')::json)->>\'modified_by\' as modified_by, ((data->>\'metadata\')::json)->>\'created\' as created_at, ((data->>\'metadata\')::json)->>\'modified\' as modified_at, data->>\'source\' as file_path',
            from_clause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY ',
            orderByClause: 'ORDER BY ',
            limitClause: 'LIMIT ',
        }
    }
}

export const DATA_BLOCK_COLUMN_TYPES = [
    { name: 'Category', value: DataBlockColumnType.CATEGORY },
    { name: 'Text', value: DataBlockColumnType.TEXT },
    { name: 'Integer', value: DataBlockColumnType.INTEGER },
    { name: 'Float', value: DataBlockColumnType.FLOAT },
    { name: 'Boolean', value: DataBlockColumnType.BOOLEAN },
    { name: 'LLM Response', value: DataBlockColumnType.LLM_RESPONSE },
];


export function postProcessCurrentDataBlockColumn(dataColumn: DataBlockColumn): DataBlockColumn {
    if (!dataColumn) return null;
    const prepareDataColumn = { ...dataColumn };
    prepareDataColumn.logs = parseContainerLogsData(prepareDataColumn.logs);
    prepareDataColumn.progress = Number(prepareDataColumn.progress?.toFixed(2));
    prepareDataColumn.dataTypeName = DATA_BLOCK_COLUMN_TYPES.find((type) => type.value === dataColumn?.dataType).name;
    if (dataColumn.sourceCode == null) {
        prepareDataColumn.sourceCode = DataBlocksColumnsCodeLookup.getDataBlocksColumnsTemplate(DataBlocksColumnsExamples.DC_EMPTY_TEMPLATE, prepareDataColumn.dataType).code;
        const regMatch: any = getPythonFunctionRegExMatch(prepareDataColumn.sourceCode);
        prepareDataColumn.sourceCodeToDisplay = prepareDataColumn.sourceCode.replace(regMatch[2], prepareDataColumn.name);
        prepareDataColumn.saveSourceCode = true;
    } else {
        const regMatch: any = getPythonFunctionRegExMatch(prepareDataColumn.sourceCode);
        if (regMatch[2] !== prepareDataColumn.name) {
            prepareDataColumn.sourceCodeToDisplay = prepareDataColumn.sourceCode.replace(regMatch[2], prepareDataColumn.name);
            prepareDataColumn.saveSourceCode = false
        }
    }

    if (prepareDataColumn.additionalConfig) {
        prepareDataColumn.additionalConfig = jsonCopy(prepareDataColumn.additionalConfig);
        if (!prepareDataColumn.additionalConfig.llmConfig.apiKey) prepareDataColumn.additionalConfig.llmConfig.apiKey = "";
    }

    return prepareDataColumn;
}

export const DATA_BLOCK_COLUMN_STATE_COLOR_DICT = {
    [DataBlockColumnState.UPLOADED]: 'indigo',
    [DataBlockColumnState.AUTOMATICALLY_CREATED]: 'indigo',
    [DataBlockColumnState.USABLE]: 'green',
    [DataBlockColumnState.RUNNING]: 'yellow',
    [DataBlockColumnState.FAILED]: 'red',
    [DataBlockColumnState.QUEUED]: 'gray',
    [DataBlockColumnState.INITIAL]: 'gray',
}

export function formatValueByDataType(value: any, dataType: string): string {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return JSON.stringify(value);
        }
        return JSON.stringify(value);
    }

    switch (dataType) {
        case DataBlockColumnType.INTEGER:
            if (typeof value === 'number') {
                return Number.isInteger(value) ? value.toString() : Math.floor(value).toString();
            }
            const intValue = parseInt(value);
            return !isNaN(intValue) ? intValue.toString() : String(value);
        case DataBlockColumnType.FLOAT:
            if (typeof value === 'number') {
                return value.toString();
            }
            const floatValue = parseFloat(value);
            return !isNaN(floatValue) ? floatValue.toString() : String(value);
        case DataBlockColumnType.BOOLEAN:
            if (typeof value === 'boolean') {
                return value ? 'true' : 'false';
            }
            if (typeof value === 'string') {
                return value.toLowerCase() === 'true' || value === '1' ? 'true' : 'false';
            }
            return value ? 'true' : 'false';
        case DataBlockColumnType.TEXT:
        case DataBlockColumnType.CATEGORY:
        case DataBlockColumnType.LLM_RESPONSE:
        default:
            return String(value);
    }
}