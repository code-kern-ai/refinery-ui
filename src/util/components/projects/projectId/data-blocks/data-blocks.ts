import { DataBlockColumn, DataBlockColumnState, DataBlockColumnType, SQLTemplates } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { DataBlocksColumnsExamples, DataBlocksColumnsCodeLookup } from "@/src/util/classes/data-blocks-columns";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { parseContainerLogsData } from "@/submodules/javascript-functions/logs-parser";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";

// These clauses are used just for the preview/formatting on the right side, they are never sent to the backend or changed by a user
export const getSQLTemplatesDict = (projectId: string) => {
    return {
        [SQLTemplates.BLANK_QUERY]: {
            selectClause: 'SELECT ',
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY ',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY ',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.INTEGRATION_AUDIT]: {
            selectClause: 'SELECT ((data->>\'metadata\')::json)->>\'sharepoint_created_by\' as created_by, ((data->>\'metadata\')::json)->>\'modified_by\' as modified_by, ((data->>\'metadata\')::json)->>\'created\' as created_at, ((data->>\'metadata\')::json)->>\'modified\' as modified_at, data->>\'source\' as file_path',
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY ',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY ',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.MATCHABLE_CHUNKS_FOR_NAME]: {
            selectClause: 'SELECT data->>\'name\' AS file_name, SUM(COALESCE(json_array_length(data->\'reference_chunks\'), 0)) AS chunk_count',
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY 1',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY 2 DESC',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.MULTIPLE_LANGUAGES]: {
            selectClause: 'SELECT data->>\'Language\' AS language, COUNT(1) AS record_count',
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY 1',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY 2 DESC',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.AVERAGE_CHUNKS_PER_RECORD]: {
            selectClause: 'SELECT AVG(json_array_length(data->\'reference_chunks\')) AS avg_chunks_per_file',
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY ',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY ',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.CHUNK_BUCKETS]: {
            selectClause: `SELECT CASE
    WHEN json_array_length(data->'reference_chunks') < 5 THEN '<5'
    WHEN json_array_length(data->'reference_chunks') < 20 THEN '5–19'
    WHEN json_array_length(data->'reference_chunks') < 50 THEN '20–49'
    ELSE '50+'
  END AS chunk_bucket,
  COUNT(1) AS file_count`,
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY 1',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY ',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.AVG_LENGTH_AVG_CHUNK_COUNT]: {
            selectClause: `SELECT data->>'name' AS file_name,
    ROUND(AVG(LENGTH(data ->> 'reference'))) AS avg_reference_length,
    ROUND(AVG(json_array_length(data -> 'reference_chunks'))) AS avg_chunk_count`,
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY 1',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY 1',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.WORD_COUNT]: {
            selectClause: `SELECT (LENGTH(data->>'headline')
   - LENGTH(REPLACE(data ->> 'headline', ' ', '')) + 1) AS word_count,
            count(1)`,
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY 1',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY 1',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.FILE_MODIFIED_BY_OTHERS]: {
            selectClause: `SELECT 
  CASE
    WHEN ((data->>'metadata')::json)->>'created_by'
       = ((data->>'metadata')::json)->>'modified_by'
    THEN 'self_modified'
    ELSE 'modified_by_other'
  END AS edit_type,
  count(1)`,
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}'`,
            groupByClause: 'GROUP BY 1',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY ',
            limitClause: 'LIMIT ',
        },
        [SQLTemplates.LIVE_QUERY_MODIFIED_LAST_WEEK]: {
            selectClause: `SELECT array_agg(r.data->>'filename')`,
            fromClause: 'FROM public.record r',
            whereClause: `WHERE project_id = '${projectId}' AND (((r.data->>'metadata')::JSON->>'modified')::TIMESTAMP > CURRENT_DATE - INTERVAL '7 days')`,
            groupByClause: 'GROUP BY ',
            havingClause: 'HAVING ',
            orderByClause: 'ORDER BY ',
            limitClause: 'LIMIT 1',
        },
    }
}

export const SQL_TEMPLATES_TOOLTIPS_DICT = [
    'Empty fields for each clause', // SQLTemplates.BLANK_QUERY
    'Audit integration data with basic information', // SQLTemplates.INTEGRATION_AUDIT,
    'How many matchable chunks can be found for each name (classic RAG Projects)', // SQLTemplates.MATCHABLE_CHUNKS_FOR_NAME
    'Do we have multiple languages?', // SQLTemplates.MULTIPLE_LANGUAGES,
    'Average chunks per record (potentially file with grouping)', // SQLTemplates.AVERAGE_CHUNKS_PER_RECORD
    'Chunk buckets (<5 might usually worth a look)', // SQLTemplates.CHUNK_BUCKETS,
    'Avg length / chunk count per file', // SQLTemplates.AVG_LENGTH_AVG_CHUNK_COUNT
    'Word count (change headline to reference if needed)', // SQLTemplates.WORD_COUNT
    'Files modified by others (approximation since only last modified is collected)', // SQLTemplates.FILE_MODIFIED_BY_OTHERS
    'Live query modified files in the last week', // SQLTemplates.LIVE_QUERY_MODIFIED_LAST_WEEK
]

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