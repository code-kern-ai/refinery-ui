import { selectProjectId } from "@/src/reduxStore/states/project";
// import { getKnowledgeGraphsDataStable } from "@/src/services/base/data-blocks";
import { arrayToDict } from "@/submodules/javascript-functions/general";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useColumns } from "./useColumns";
import { selectAllUsers } from "@/src/reduxStore/states/general";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { camelCaseToWords } from "@/submodules/javascript-functions/case-types-parser";
import useRefFor from "@/submodules/react-components/hooks/useRefFor";
import { SortDirection, SortKeyIdx } from "@/submodules/react-components/types/sort";
import { nextSortDirectionByIdx, sortBySortKeyIdx, sortPreppedArrayByIdx } from "@/submodules/react-components/helpers/sort-functions";
import useRefState from "@/submodules/react-components/hooks/useRefState";

const VISIBLE_KEYS_INTEGRATIONS = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'runningId', 'errorMessage', 'extension', 'name', 'size', 'content'];
const DATE_KEYS = ['createdAt', 'updatedAt', 'created', 'modified'];
const USER_KEYS = ['createdBy', 'updatedBy'];
const FILE_SIZE_KEYS = ['size', 'maxSize', 'sumSize', 'avgSize', 'minSize'];

const getCheckedNames = <T extends { checked: boolean; name: string }>(items: T[]) => items.filter(i => i.checked).map(i => i.name);
const getChecked = <T extends { checked: boolean; name: string }>(items: T[]) => items.map(i => i.checked);
export const DEFAULT_SORT_KEY_STABLE_KG: SortKeyIdx = {
    idx: 2, // 'createdAtDate',
    dataType: 'string',
    direction: SortDirection.DESC
}


export default function StableKnowledgeGraphDetailsOverview() {
    // const projectId = useSelector(selectProjectId);
    // const users = useSelector(selectAllUsers);
    // const usersDict = arrayToDict(users, 'id');

    // const [stableData, setStableData] = useState(null);
    // const [selectedHeaders, setSelectedHeaders] = useState<{ name: string, checked: boolean }[]>([]);
    // const [searchTerm, setSearchTerm] = useState('');

    // const [selectedGroupBy, setSelectedGroupBy] = useState<{ name: string, checked: boolean }[]>([]);
    // const [groupByOptions, setGroupByOptions] = useState<string[]>([]);
    // const [selectedAggregateBy, setSelectedAggregateBy] = useState<{ name: string, checked: boolean }[]>([]);
    // const [aggregateByOptions, setAggregateByOptions] = useState<string[]>([]);
    // const [selectedAggregateFunctions, setSelectedAggregateFunctions] = useState<{ name: string, checked: boolean }[]>([]);
    // const [aggregateFunctionsOptions, setAggregateFunctionsOptions] = useState<string[]>([]);
    // const { state: sortKey, setState: setSortKey, ref: sortKeyRef } = useRefState(DEFAULT_SORT_KEY_STABLE_KG);


    // const getAndFilterKnowledgeGraphsDataStable = useCallback(() => {
    //     if (!projectId) return;
    //     const groupBy = selectedGroupBy.filter(g => g.checked).map(g => g.name);
    //     const aggregateBy = selectedAggregateBy.filter(a => a.checked).map(a => a.name);
    //     const aggregateFunctions = selectedAggregateFunctions.filter(f => f.checked).map(f => f.name);
    //     getKnowledgeGraphsDataStable(projectId, searchTerm, groupBy, aggregateBy, aggregateFunctions, (result) => {
    //         setStableData(result.records);
    //         setGroupByOptions(result.groupBy);
    //         setAggregateByOptions(result.aggregateBy);
    //         setAggregateFunctionsOptions(result.aggregateFunctions);
    //     });
    // }, [projectId, searchTerm, selectedGroupBy, selectedAggregateBy, selectedAggregateFunctions]);

    // useEffect(() => {
    //     if (!projectId) return;
    //     getAndFilterKnowledgeGraphsDataStable();
    // }, [projectId]);

    // useEffect(() => {
    //     if (!stableData || stableData.length == 0) return;
    //     const checkIfNoFilters = [...selectedGroupBy, ...selectedAggregateBy, ...selectedAggregateFunctions].every(f => !f.checked);
    //     if (checkIfNoFilters) {
    //         setSelectedHeaders(Object.keys(stableData[0]).map(key => ({ name: key, checked: VISIBLE_KEYS_INTEGRATIONS.includes(key) })));
    //     } else {
    //         setSelectedHeaders(Object.keys(stableData[0]).map(key => ({ name: key, checked: true })));
    //     }
    //     setSelectedGroupBy(groupByOptions.map(option => {
    //         const existing = selectedGroupBy.find(g => g.name === option);
    //         return { name: option, checked: existing ? existing.checked : false };
    //     }));
    //     setSelectedAggregateBy(aggregateByOptions.map(option => {
    //         const existing = selectedAggregateBy.find(a => a.name === option);
    //         return { name: option, checked: existing ? existing.checked : false };
    //     }));
    // }, [stableData, groupByOptions, aggregateByOptions]);

    // useEffect(() => {
    //     const noneSelected = selectedAggregateBy.every(g => !g.checked);
    //     const aggFunctions = noneSelected ? ['count'] : aggregateFunctionsOptions;
    //     setSelectedAggregateFunctions(aggFunctions.map(option => {
    //         const existing = selectedAggregateFunctions.find(f => f.name === option);
    //         return { name: option, checked: existing ? existing.checked : false };
    //     }));
    // }, [selectedAggregateBy, aggregateFunctionsOptions]);

    // const activeHeaders = useMemo(() => {
    //     return getCheckedNames(selectedHeaders);
    // }, [selectedHeaders]);

    // const { renderCell } = useColumns({
    //     dateKeys: DATE_KEYS,
    //     fileSizeKeys: FILE_SIZE_KEYS,
    //     userKeys: USER_KEYS,
    //     usersDict: usersDict
    // });

    // const clearFilters = useCallback(() => {
    //     setStableData(null);
    //     setSelectedHeaders(selectedHeaders.map(h => ({ name: h.name, checked: VISIBLE_KEYS_INTEGRATIONS.includes(h.name) })));
    //     setSearchTerm('');
    //     setSelectedGroupBy(selectedGroupBy.map(g => ({ name: g.name, checked: false })));
    //     setSelectedAggregateBy(selectedAggregateBy.map(a => ({ name: a.name, checked: false })));
    //     setSelectedAggregateFunctions(selectedAggregateFunctions.map(f => ({ name: f.name, checked: false })));
    //     getAndFilterKnowledgeGraphsDataStable();
    // }, []);

    // const preparedData = useMemo(() => {
    //     if (!stableData || stableData.length === 0 || !activeHeaders || activeHeaders.length === 0) return [];
    //     const values = stableData.map((row: any) =>
    //         activeHeaders.map((header) => renderCell(header, row[header]))
    //     );
    //     sortBySortKeyIdx(values, sortKeyRef.current)
    //     return values;
    // }, [stableData, activeHeaders]);

    // const preparedHeaders = useMemo(() => {
    //     return activeHeaders.map((header) => ({
    //         column: camelCaseToWords(header),
    //         id: header,
    //         hasSort: true,
    //         wrapWhitespace: true
    //     }));
    // }, [activeHeaders]);

    // const preparedValuesRef = useRefFor(preparedData);

    // const tableConfig = useMemo(() => {
    //     function sortByPropertyIdx(idx: number) {
    //         if (!preparedValuesRef.current || preparedValuesRef.current.length === 0) return;

    //         let newSortKey: SortKeyIdx;
    //         if (nextSortDirectionByIdx(idx, sortKey) === SortDirection.NO_SORT) {
    //             newSortKey = { ...DEFAULT_SORT_KEY_STABLE_KG };
    //             if (sortKey.idx === newSortKey.idx) newSortKey.direction = SortDirection.ASC;
    //             sortBySortKeyIdx(preparedValuesRef.current, newSortKey);
    //         } else {
    //             newSortKey = sortPreppedArrayByIdx(preparedValuesRef.current, idx, sortKey);
    //         }
    //         setSortKey(newSortKey);
    //     }

    //     return {
    //         sortKeyIdx: sortKey,
    //         onClickSortIdx: (idx: number) => sortByPropertyIdx(idx)
    //     }
    // }, [sortKey])

    return <>
        {/* {preparedData && <>
            <p className="text-lg font-medium leading-6 text-gray-700 mb-4">Filter data</p>
            <div className="flex flex-row items-center gap-x-4">
                <div className="flex flex-col items-center">
                    <label className="text-sm text-gray-700">Group by:</label>
                    <KernDropdown options={selectedGroupBy} buttonName={getCheckedNames(selectedGroupBy).join(', ') || 'Select group by'}
                        hasCheckboxes={true} selectedCheckboxes={getChecked(selectedGroupBy)} selectedOption={setSelectedGroupBy} hasSelectAll={true} truncateButtonName={true}
                        scrollAfterNOptions={10}
                        dropdownWidth="w-[300px]"
                        dropdownItemsClasses="w-[300px]" />
                </div>

                <div className="flex flex-col items-center">
                    <label className="text-sm text-gray-700">Aggregate by:</label>
                    <KernDropdown options={selectedAggregateBy} buttonName={getCheckedNames(selectedAggregateBy).join(', ') || 'Select aggregate by'}
                        hasCheckboxes={true} selectedCheckboxes={getChecked(selectedAggregateBy)} selectedOption={setSelectedAggregateBy} hasSelectAll={true} truncateButtonName={true}
                        scrollAfterNOptions={10}
                        dropdownWidth="w-[300px]"
                        dropdownItemsClasses="w-[300px]" />
                </div>

                <div className="flex flex-col items-center">
                    <label className="text-sm text-gray-700">Aggregate functions:</label>
                    <KernDropdown options={selectedAggregateFunctions} buttonName={getCheckedNames(selectedAggregateFunctions).join(', ') || 'Select aggregate functions'}
                        hasCheckboxes={true} selectedCheckboxes={getChecked(selectedAggregateFunctions)} selectedOption={setSelectedAggregateFunctions} hasSelectAll={true} truncateButtonName={true}
                        scrollAfterNOptions={10}
                        dropdownWidth="w-[300px]"
                        dropdownItemsClasses="w-[300px]" />
                </div>

                <div className="flex flex-col items-center">
                    <label className="text-sm text-gray-700">Search term:</label>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Enter text"
                        className="block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <KernButton text="Apply" onClick={getAndFilterKnowledgeGraphsDataStable} className="mt-4" buttonColor="indigo" textColor="white" solidTheme />
                <KernButton text="Clear" onClick={clearFilters} className="mt-4" buttonColor="gray" textColor="white" solidTheme />
            </div>

            <div className="flex flex-row items-center gap-x-4 mt-6">
                <div className="flex flex-col items-center">
                    <label className="text-sm text-gray-700">Columns in records:</label>
                    <KernDropdown options={selectedHeaders} buttonName={getCheckedNames(selectedHeaders).length > 0 ? getCheckedNames(selectedHeaders).join(', ') : 'Select columns'}
                        hasCheckboxes={true} selectedCheckboxes={getChecked(selectedHeaders)} selectedOption={setSelectedHeaders} hasSelectAll={true} truncateButtonName={true}
                        scrollAfterNOptions={10}
                        dropdownWidth="w-[300px]"
                        dropdownItemsClasses="w-[300px]" />
                </div>

            </div>
            <div className="inline-block min-w-full align-middle mt-3">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg" style={{ padding: '3px' }}>
                    <KernTable
                        headers={preparedHeaders}
                        values={preparedData}
                        config={tableConfig}
                    />
                </div>
            </div>
        </>} */}
    </>
}