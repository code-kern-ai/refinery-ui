import CopyToClipboard from "@/submodules/react-components/components/CopyToClipboard";
import { MemoIconInfoCircleFilled } from "@/submodules/react-components/components/kern-icons/icons";
import { Tooltip } from "@nextui-org/react";
import { memo } from "react";

function formatRowAsText(row: any): string {
    if (!row || typeof row !== 'object') {
        return JSON.stringify(row, null, 2);
    }

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) {
            return '(null)';
        }
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return JSON.stringify(value);
            }
            return JSON.stringify(value);
        }
        return String(value);
    };

    const entries: string[] = [];
    for (const key in row) {
        if (row.hasOwnProperty(key)) {
            let cellValue = row[key];
            if (key === 'data' && typeof cellValue === 'object' && cellValue !== null) {
                if (!Array.isArray(cellValue)) {
                    const dataEntries = Object.keys(cellValue).map(dataKey => {
                        return `${dataKey}: ${formatValue(cellValue[dataKey])}`;
                    });
                    entries.push(`${key}: { ${dataEntries.join(', ')} }`);
                } else {
                    entries.push(`${key}: ${formatValue(cellValue)}`);
                }
            } else {
                entries.push(`${key}: ${formatValue(cellValue)}`);
            }
        }
    }

    return entries.length > 0 ? entries.join(', ') : JSON.stringify(row, null, 2);
}

function DataBlockLiveQueryResults({ liveQueryData }: { liveQueryData: any }) {
    let data: any[] = [];
    if (Array.isArray(liveQueryData)) {
        data = liveQueryData;
    } else if (liveQueryData && typeof liveQueryData === 'object') {
        if (liveQueryData.rows && Array.isArray(liveQueryData.rows)) {
            data = liveQueryData.rows;
        } else if (liveQueryData.data && Array.isArray(liveQueryData.data)) {
            data = liveQueryData.data;
        } else {
            data = Object.values(liveQueryData);
        }
    }

    if (!data || data.length === 0) {
        return (
            <div className="mt-8">
                <h1 className="text-lg font-medium text-gray-900">Data Block Live Query Results</h1>
                <p className="text-sm text-gray-500">No results available.</p>
            </div>
        );
    }

    const formattedResults = data.map((row: any, index: number) => {
        try {
            return `Row ${index + 1}: ${formatRowAsText(row)}`;
        } catch (error) {
            return `Row ${index + 1}: ${JSON.stringify(row)}`;
        }
    }).join('\n');

    return (
        <div className="mt-8">
            <h1 className="text-lg font-medium text-gray-900">Data Block Live Query Results</h1>
            <div className="flex flex-row gap-x-2 items-center mb-4">
                <p className="text-sm text-gray-500">Results of the live query execution.</p>
                <CopyToClipboard nameToCopy={formattedResults} />
                <Tooltip content="Disclaimer:This is temporary data, it will be lost on page refresh or when the query is executed again" color="invert" placement="right" className="cursor-default">
                    <MemoIconInfoCircleFilled className="h-5 w-5 text-blue-500" />
                </Tooltip>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {formattedResults}
                </pre>
            </div>
        </div>
    );
}

export default memo(DataBlockLiveQueryResults);