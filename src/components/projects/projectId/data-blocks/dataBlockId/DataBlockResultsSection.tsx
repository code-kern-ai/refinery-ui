import { selectDataBlock } from "@/src/reduxStore/states/pages/data-blocks";
import { useSelector } from "react-redux";
import { DataBlockColumnType } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";

function formatValueByDataType(value: any, dataType: string): string {
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

function formatRowAsText(row: any, sqlSchema: any[]): string {
    if (!sqlSchema || sqlSchema.length === 0) {
        return JSON.stringify(row, null, 2);
    }

    return sqlSchema.map((column: any) => {
        const columnName = column.columnName;
        const columnDataType = column.columnDataType || '';
        let cellValue = row[columnName];
        if (cellValue === undefined && typeof row === 'object') {
            cellValue = row.data?.[columnName] || row[columnName];
        }
        if (cellValue === undefined) {
            return `${columnName}: (not found)`;
        }
        const formattedValue = formatValueByDataType(cellValue, columnDataType);
        return `${columnName}: ${formattedValue}`;
    }).join(', ');
}

export default function DataBlockResultsSection() {
    const currentDataBlock = useSelector(selectDataBlock);
    const sqlSchema = currentDataBlock?.sqlSchema || [];
    const rawData = currentDataBlock?.data;

    let data: any[] = [];
    if (Array.isArray(rawData)) {
        data = rawData;
    } else if (rawData && typeof rawData === 'object') {
        if (rawData.rows && Array.isArray(rawData.rows)) {
            data = rawData.rows;
        } else if (rawData.data && Array.isArray(rawData.data)) {
            data = rawData.data;
        } else {
            data = Object.values(rawData);
        }
    }

    if (!data || data.length === 0) {
        return (
            <div className="mt-8">
                <h1 className="text-lg font-medium text-gray-900">Data Block Results</h1>
                <p className="text-sm text-gray-500">No results available.</p>
            </div>
        );
    }

    const formattedResults = data.map((row: any, index: number) => {
        try {
            return `Row ${index + 1}: ${formatRowAsText(row, sqlSchema)}`;
        } catch (error) {
            return `Row ${index + 1}: ${JSON.stringify(row)}`;
        }
    }).join('\n');

    return (
        <div className="mt-8">
            <h1 className="text-lg font-medium text-gray-900">Data Block Results</h1>
            <p className="text-sm text-gray-500 mb-4">Results of the data block query.</p>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {formattedResults}
                </pre>
            </div>
        </div>
    );
}