import { selectUser } from "@/src/reduxStore/states/general";
import { openModal } from "@/src/reduxStore/states/modal";
import { removeFromRlaById, selectRecordRequestsRecord, selectRecordRequestsRla, selectSettings, selectTmpHighlightIds, selectUserDisplayId, tmpAddHighlightIds } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { DELETE_RECORD_LABEL_ASSOCIATION_BY_ID } from "@/src/services/gql/mutations/labeling";
import { HeaderHover, TableDisplayData } from "@/src/types/components/projects/projectId/labeling/overview-table";
import { ModalEnum } from "@/src/types/shared/modal";
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { buildOverviewTableDisplayArray, filterRlaDataForUser, filterRlaLabelCondition, getEmptyHeaderHover, rlasHaveHeuristicData } from "@/src/util/components/projects/projectId/labeling/overview-table-helper";
import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { useMutation } from "@apollo/client";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LabelingInfoTableModal from "./LabelingInfoTableModal";


function shouldHighLight(tmpHighlightIds: string[], comparedIds: string[]) {
    return tmpHighlightIds.some(id => comparedIds.includes(id));
}

export default function LabelingSuiteOverviewTable() {
    const dispatch = useDispatch();

    const rlas = useSelector(selectRecordRequestsRla);
    const record = useSelector(selectRecordRequestsRecord);
    const user = useSelector(selectUser);
    const settings = useSelector(selectSettings);
    const projectId = useSelector(selectProjectId);
    const displayUserId = useSelector(selectUserDisplayId);

    const [dataToDisplay, setDataToDisplay] = useState<TableDisplayData[]>(null);
    const [fullData, setFullData] = useState<TableDisplayData[]>([]);
    const [dataHasHeuristics, setDataHasHeuristics] = useState(false);
    const [headerHover, setHeaderHover] = useState<HeaderHover>(getEmptyHeaderHover());

    const [deleteRlaByIdMut] = useMutation(DELETE_RECORD_LABEL_ASSOCIATION_BY_ID);

    useEffect(() => {
        if (!rlas) {
            setDataToDisplay(null);
            setFullData(null);
        }
        setFullData(buildOverviewTableDisplayArray(rlas, user));
        checkAndRebuildTableHover();
        setDataHasHeuristics(rlasHaveHeuristicData(rlas));
    }, [rlas]);

    useEffect(() => {
        if (!fullData) return;
        if (!settings) return;
        rebuildDataForDisplay();
    }, [settings, fullData]);

    useEffect(() => {
        if (!displayUserId) return;
        rebuildDataForDisplay();
    }, [displayUserId]);

    function prepareDataForTableDisplay() {
        if (!rlas) {
            setDataToDisplay(null);
            setFullData(null);
        }
        setFullData(buildOverviewTableDisplayArray(rlas, user));
        checkAndRebuildTableHover();
        setDataHasHeuristics(rlasHaveHeuristicData(rlas));
    }

    function checkAndRebuildTableHover() {
        if (!fullData) return;
        setHeaderHover(getEmptyHeaderHover());
        const headerHoverCopy = { ...headerHover };
        for (const data of fullData) {
            headerHoverCopy.typeCollection += data.hoverGroups.type.split(',')[0] + ', ';
            headerHoverCopy.taskCollection += data.hoverGroups.task.split(',')[0] + ', ';
            headerHoverCopy.createdByCollection += data.hoverGroups.createdBy.split(',')[0] + ', ';
            headerHoverCopy.labelCollection += data.hoverGroups.label.split(',')[0] + ', ';
            headerHoverCopy.rlaCollection += data.hoverGroups.rlaId.split(',')[0] + ', ';
        }
        setHeaderHover(headerHoverCopy);
    }

    function rebuildDataForDisplay() {
        if (fullData) {
            let filtered = fullData;
            filtered = filterRlaDataForUser(filtered, user, displayUserId, 'rla');
            filtered = filterRlaDataForOverviewTable(filtered, 'rla');
            setDataToDisplay(filtered);
        } else {
            setDataToDisplay(null);
        }
    }

    function filterRlaDataForOverviewTable(data: any[], rlaKey?: string): any[] {
        let filtered = data;
        if (!settings.overviewTable.showHeuristics) {
            if (rlaKey) filtered = filtered.filter(entry => entry[rlaKey].sourceType != LabelSource.INFORMATION_SOURCE);
            else filtered = filtered.filter(rla => rla.sourceType != LabelSource.INFORMATION_SOURCE);
        }
        if (settings.overviewTable.includeLabelDisplaySettings) {
            if (rlaKey) filtered = filtered.filter(entry => filterRlaLabelCondition(entry[rlaKey], settings, projectId));
            else filtered = filtered.filter(rla => filterRlaLabelCondition(rla, settings, projectId));
        }
        return filtered;
    }

    function deleteLabelFromRecord(rlaId: string) {
        LabelingSuiteManager.somethingLoading = true;
        deleteRlaByIdMut({ variables: { projectId: projectId, recordId: record.id, associationIds: [rlaId] } }).then(res => {
            dispatch(removeFromRlaById(rlaId));
        });
    }

    const tmpHighlightIds = useSelector(selectTmpHighlightIds);

    function onMouseEnter(ids: string[]) {
        dispatch(tmpAddHighlightIds(ids));
    }

    function onMouseLeave() {
        dispatch(tmpAddHighlightIds([]));
    }

    return (<>
        {dataToDisplay && (dataToDisplay.length > 0) ? (<>
            <div className="flex flex-col p-4">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full border divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-2 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">Type</th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Task</th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Created by</th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Label</th>
                                        <th scope="col"></th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {dataToDisplay.map((ovItem, index) => (<tr key={ovItem.rla.id} className={`${index % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6"> {ovItem.sourceType}</td>
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{ovItem.taskName}</td>
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{ovItem.createdBy}</td>
                                        <td className={`whitespace-nowrap px-3 py-2 text-sm text-gray-500 ${shouldHighLight(tmpHighlightIds, ovItem.shouldHighlightOn) ? settings.main.hoverGroupBackgroundColorClass : ''}`}>
                                            <span onMouseEnter={() => onMouseEnter([ovItem.label.name])} onMouseLeave={onMouseLeave}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-sm font-medium cursor-default relative ${ovItem.label.backgroundColor} ${ovItem.label.textColor} ${ovItem.label.borderColor}`}>
                                                {ovItem.label.name}
                                                <div className="label-overlay-base"></div>
                                            </span>
                                            {ovItem.label.value && <div className="ml-2">{ovItem.label.value}</div>}
                                        </td>
                                        <td className="w-icon">
                                            <IconSearch className="w-6 h-6 text-gray-700" />
                                        </td>
                                        <td className="w-icon">
                                            {ovItem.canBeDeleted && <div onClick={() => deleteLabelFromRecord(ovItem.rla.id)}>
                                                <IconTrash className="w-6 h-6 text-red-700" /></div>}
                                        </td>
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 text-sm font-normal">You can hover over the table entries to highlight
                        everything <span className="underline cursor-pointer" onClick={() => dispatch(openModal(ModalEnum.LABELING_INFO_TABLE))}>related</span> to the column</p>
                </div>
            </div>
            <LabelingInfoTableModal dataToDisplay={dataToDisplay} />
        </>) : (<>
            {!settings.showHeuristics && dataHasHeuristics && <p className="text-gray-500 p-5">Heuristics display is currently disabled</p>}
        </>)}
    </>)
}