import { selectProjectId } from "@/src/reduxStore/states/project";
import { getKnowledgeGraphsDataStable } from "@/src/services/base/knowledge-graphs";
import { arrayToDict } from "@/submodules/javascript-functions/general";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useColumns } from "./useColumns";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";

const VISIBLE_KEYS_INTEGRATIONS = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'runningId', 'errorMessage', 'extension', 'name', 'size', 'content'];
const DATE_KEYS = ['createdAt', 'updatedAt', 'created', 'modified'];
const USER_KEYS = ['createdBy', 'updatedBy'];
const FILE_SIZE_KEYS = ['size'];

export default function StableKnowledgeGraphDetailsOverview() {
    const projectId = useSelector(selectProjectId);
    const users = useSelector(selectAllUsers);
    const usersDict = arrayToDict(users, 'id');

    const [stableData, setStableData] = useState(null);
    const [selectedHeaders, setSelectedHeaders] = useState<{ name: string, checked: boolean }[]>([]);

    useEffect(() => {
        if (!projectId) return;
        getKnowledgeGraphsDataStable(projectId, (result) => setStableData(result));
    }, [projectId]);

    useEffect(() => {
        if (!stableData) return;
        setSelectedHeaders(Object.keys(stableData[0]).map(key => ({ name: key, checked: VISIBLE_KEYS_INTEGRATIONS.includes(key) })));
    }, [stableData]);

    const mappedHeadersByName = useMemo(() => {
        return selectedHeaders.filter(h => h.checked).map(h => h.name);
    }, [selectedHeaders]);

    const mappedHeadersByChecked = useMemo(() => {
        return selectedHeaders.map(h => h.checked);
    }, [selectedHeaders]);

    const activeHeaders = useMemo(() => {
        return selectedHeaders.filter(h => h.checked).map(h => h.name);
    }, [selectedHeaders]);

    const { renderCell } = useColumns({
        dateKeys: DATE_KEYS,
        fileSizeKeys: FILE_SIZE_KEYS,
        userKeys: USER_KEYS,
        usersDict: usersDict
    });

    return <>
        {stableData && <>
            <p className="text-lg font-medium leading-6 text-gray-700 mb-4">Filter data</p>
            <div className="flex flex-row items-end gap-x-4">
                <div className="flex flex-col items-center">
                    <label className="text-sm text-gray-700">Columns:</label>
                    <KernDropdown options={selectedHeaders} buttonName={mappedHeadersByName.length > 0 ? mappedHeadersByName.join(', ') : 'Select columns'}
                        hasCheckboxes={true} selectedCheckboxes={mappedHeadersByChecked} selectedOption={setSelectedHeaders} hasSelectAll={true} truncateButtonName={true}
                        scrollAfterNOptions={10}
                        dropdownWidth="w-[300px]"
                        dropdownItemsClasses="w-[300px]" />
                </div>

            </div>
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg" style={{ padding: '3px' }}>
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                {activeHeaders.map(header => (
                                    <th key={header} className="border px-3 py-2 text-left text-sm font-medium">
                                        {header}
                                    </th>
                                ))}
                                {activeHeaders.length === 0 && <th className="border px-3 py-2 text-left text-sm font-medium text-gray-500">
                                    No columns selected.
                                </th>}
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
                    </table>
                </div>
            </div>
        </>}
    </>
}