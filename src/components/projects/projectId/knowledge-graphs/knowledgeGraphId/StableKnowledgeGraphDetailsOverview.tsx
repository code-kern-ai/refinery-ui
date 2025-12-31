import { selectProjectId } from "@/src/reduxStore/states/project";
import { getKnowledgeGraphsDataStable } from "@/src/services/base/knowledge-graphs";
import { parseUTC } from "@/submodules/javascript-functions/date-parser";
import { arrayToDict, formatBytes } from "@/submodules/javascript-functions/general";
import { NotApplicableBadge } from "@/submodules/react-components/components/Badges";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useColumns } from "./useColumns";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import { useConsoleLog } from "@/submodules/react-components/hooks/useConsoleLog";

const VISIBLE_KEYS_INTEGRATIONS = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'runningId', 'errorMessage', 'extension', 'name', 'size', 'content'];
const DATE_KEYS = ['createdAt', 'updatedAt', 'created', 'modified'];
const USER_KEYS = ['createdBy', 'updatedBy'];
const FILE_SIZE_KEYS = ['size'];

export default function StableKnowledgeGraphDetailsOverview() {
    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const usersDict = arrayToDict(users, 'id');
    useConsoleLog(usersDict)

    const [stableData, setStableData] = useState(null);
    const [tableHeaders, setTableHeaders] = useState<string[]>([]);
    const [visibleHeaders, setVisibleHeaders] = useState(new Set(VISIBLE_KEYS_INTEGRATIONS.filter(col => tableHeaders.includes(col))));

    useEffect(() => {
        if (!projectId) return;
        getKnowledgeGraphsDataStable(projectId, (result) => {
            setStableData(result);
        });
    }, [projectId]);

    useEffect(() => {
        if (!stableData) return;
        const keys = new Set<string>();
        Object.keys(stableData[0]).forEach(key => {
            if (typeof stableData[0][key] === 'object' && stableData[0][key] !== null) return;
            keys.add(key)
        });
        setTableHeaders(Array.from(keys));
    }, [stableData]);

    useEffect(() => {
        setVisibleHeaders(prev => {
            const next = new Set(prev);
            for (const col of next) {
                if (!tableHeaders.includes(col)) {
                    next.delete(col);
                }
            }
            VISIBLE_KEYS_INTEGRATIONS.forEach(col => {
                if (tableHeaders.includes(col)) {
                    next.add(col);
                }
            });
            return next;
        });
    }, [tableHeaders]);

    const toggleHeaders = useCallback((key: string) => {
        setVisibleHeaders(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    const activeHeaders = useMemo(() => tableHeaders.filter(h => visibleHeaders.has(h)), [tableHeaders, visibleHeaders]);

    const { renderCell } = useColumns({
        dateKeys: DATE_KEYS,
        fileSizeKeys: FILE_SIZE_KEYS,
        userKeys: USER_KEYS,
        usersDict: usersDict
    });

    return <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {tableHeaders.map(header => (
                <label key={header} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" onChange={() => toggleHeaders(header)} checked={visibleHeaders.has(header)} />
                    {header}
                </label>
            ))}
        </div>
        <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg" style={{ padding: '3px' }}>
                {stableData && tableHeaders.length > 0 && <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            {activeHeaders.map(header => (
                                <th key={header} className="border px-3 py-2 text-left text-sm font-medium">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {stableData && stableData.map((row: any, rowIndex: number) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                {activeHeaders.map((header) => (
                                    <td key={header} className="border px-3 py-2 text-sm text-gray-900">
                                        {renderCell(header, row[header])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>}
            </div>
        </div>
    </div>
}