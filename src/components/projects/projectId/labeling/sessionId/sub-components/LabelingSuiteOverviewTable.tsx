import { selectUser } from "@/src/reduxStore/states/general";
import { openModal } from "@/src/reduxStore/states/modal";
import { removeFromRlaById, selectDisplayUserRole, selectHoverGroupDict, selectRecordRequestsRecord, selectRecordRequestsRla, selectSettings, selectTmpHighlightIds, selectUserDisplayId, setHoverGroupDict, tmpAddHighlightIds } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { HeaderHover, TableDisplayData } from "@/src/types/components/projects/projectId/labeling/overview-table";
import { ModalEnum } from "@/src/types/shared/modal";
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { buildOverviewTableDisplayArray, filterRlaDataForUser, filterRlaLabelCondition, getEmptyHeaderHover, rlasHaveHeuristicData } from "@/src/util/components/projects/projectId/labeling/overview-table-helper";
import { LabelSource } from "@/submodules/javascript-functions/enums/enums";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LabelingInfoTableModal from "./LabelingInfoTableModal";
import { LabelingPageParts } from "@/src/types/components/projects/projectId/labeling/labeling-main-component";
import style from '@/src/styles/components/projects/projectId/labeling.module.css';
import { LabelSourceHover } from "@/src/types/components/projects/projectId/labeling/labeling";
import { UserRole } from "@/src/types/shared/sidebar";
import { deleteRecordLabelAssociationByIds } from "@/src/services/base/labeling";


function shouldHighLight(tmpHighlightIds: string[], comparedIds: string[], additionalComparedIds?: string[]) {
    if (additionalComparedIds) {
        return tmpHighlightIds.some(id => comparedIds.includes(id)) || tmpHighlightIds.some(id => additionalComparedIds.includes(id));
    }
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
    const hoverGroupsDict = useSelector(selectHoverGroupDict);
    const tmpHighlightIds = useSelector(selectTmpHighlightIds);
    const userDisplayRole = useSelector(selectDisplayUserRole);

    const [dataToDisplay, setDataToDisplay] = useState<TableDisplayData[]>(null);
    const [fullData, setFullData] = useState<TableDisplayData[]>([]);
    const [dataHasHeuristics, setDataHasHeuristics] = useState(false);
    const [headerHover, setHeaderHover] = useState<HeaderHover>(getEmptyHeaderHover());

    useEffect(() => {
        if (!user || !userDisplayRole) return;
        if (!rlas) {
            setDataToDisplay(null);
            setFullData(null);
        }
        setFullData(buildOverviewTableDisplayArray(rlas, user, userDisplayRole));
        setDataHasHeuristics(rlasHaveHeuristicData(rlas));
    }, [rlas, user, userDisplayRole]);

    useEffect(() => {
        if (!fullData) return;
        if (!settings) return;
        rebuildDataForDisplay();
        setHeaderHover(getEmptyHeaderHover());
    }, [settings, fullData]);

    useEffect(() => {
        if (!displayUserId) return;
        rebuildDataForDisplay();
    }, [displayUserId]);

    function rebuildDataForDisplay() {
        if (fullData) {
            let filtered = fullData;
            filtered = filterRlaDataForUser(filtered, user, displayUserId, userDisplayRole, 'rla');
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
        deleteRecordLabelAssociationByIds(projectId, record.id, [rlaId], () => {
            dispatch(removeFromRlaById(rlaId));
        });
    }

    function onMouseEnter(ids: string[], labelId?: string, sourceType?: string) {
        dispatch(tmpAddHighlightIds(ids));
        if (labelId && sourceType) onMouseEvent(true, labelId, sourceType);
        else if (labelId && !sourceType) {
            let hoverGroupsDictCopy = {};
            if (!hoverGroupsDictCopy[labelId]) {
                hoverGroupsDictCopy[labelId] = {
                    [LabelingPageParts.TASK_HEADER]: true,
                    [LabelingPageParts.OVERVIEW_TABLE]: true,
                    [LabelingPageParts.TABLE_MODAL]: true,
                    [LabelSourceHover.MANUAL]: true,
                    [LabelSourceHover.WEAK_SUPERVISION]: true,
                    [LabelSourceHover.INFORMATION_SOURCE]: true,
                }
                dispatch(setHoverGroupDict(hoverGroupsDictCopy));
            } else {
                dispatch(setHoverGroupDict(null));
            }
        }
    }

    function onMouseLeave() {
        dispatch(tmpAddHighlightIds([]));
        dispatch(setHoverGroupDict(null));
    }

    function onMouseEvent(update: boolean, labelId: string, sourceTypeKey?: string) {
        let hoverGroupsDictCopy = {};
        if (!hoverGroupsDictCopy[labelId] && update) {
            hoverGroupsDictCopy[labelId] = {
                [LabelingPageParts.TASK_HEADER]: true,
                [LabelingPageParts.OVERVIEW_TABLE]: true,
                [LabelingPageParts.TABLE_MODAL]: true,
                [sourceTypeKey]: true,
            }
            dispatch(setHoverGroupDict(hoverGroupsDictCopy));
        } else {
            dispatch(setHoverGroupDict(null));
        }
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
                                        <th scope="col" onMouseEnter={() => onMouseEnter(headerHover.typeCollection)} onMouseLeave={onMouseLeave}
                                            className={`py-2 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6 ${shouldHighLight(tmpHighlightIds, headerHover.typeCollection, headerHover.typeCollection) ? headerHover.class : ''}`}>Type</th>
                                        <th scope="col" onMouseEnter={() => onMouseEnter(headerHover.taskCollection)} onMouseLeave={onMouseLeave}
                                            className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 ${shouldHighLight(tmpHighlightIds, headerHover.taskCollection, headerHover.taskCollection) ? headerHover.class : ''}`}>Task</th>
                                        <th scope="col" onMouseEnter={() => onMouseEnter(headerHover.createdByCollection)} onMouseLeave={onMouseLeave}
                                            className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 ${shouldHighLight(tmpHighlightIds, headerHover.createdByCollection, headerHover.createdByCollection) ? headerHover.class : ''}`}>Created by</th>
                                        <th scope="col" onMouseEnter={() => onMouseEnter(headerHover.labelCollection)} onMouseLeave={onMouseLeave}
                                            className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 ${shouldHighLight(tmpHighlightIds, headerHover.labelCollection, headerHover.labelCollection) ? headerHover.class : ''}`}>Label</th>
                                        <th scope="col"></th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {dataToDisplay.map((ovItem, index) => (<tr key={ovItem.rla.id} className={`${index % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td onMouseEnter={() => onMouseEnter([ovItem.sourceTypeKey])} onMouseLeave={onMouseLeave}
                                            className={`whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6 ${(shouldHighLight(tmpHighlightIds, ovItem.shouldHighlightOn, headerHover.typeCollection) || hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.OVERVIEW_TABLE] && hoverGroupsDict[ovItem.label.id][ovItem.sourceTypeKey]) ? settings.main.hoverGroupBackgroundColorClass : ''}`}> {ovItem.sourceType}</td>
                                        <td onMouseEnter={() => onMouseEnter([ovItem.taskId])} onMouseLeave={onMouseLeave}
                                            className={`whitespace-nowrap px-3 py-2 text-sm text-gray-500 ${(shouldHighLight(tmpHighlightIds, ovItem.shouldHighlightOn, headerHover.taskCollection) || hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.OVERVIEW_TABLE] && hoverGroupsDict[ovItem.label.id][ovItem.sourceTypeKey]) ? settings.main.hoverGroupBackgroundColorClass : ''}`}>{ovItem.taskName}</td>
                                        <td onMouseEnter={() => onMouseEnter([ovItem.createdBy])} onMouseLeave={onMouseLeave}
                                            className={`whitespace-nowrap px-3 py-2 text-sm text-gray-500 ${(shouldHighLight(tmpHighlightIds, ovItem.shouldHighlightOn, headerHover.createdByCollection) || hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.OVERVIEW_TABLE] && hoverGroupsDict[ovItem.label.id][ovItem.sourceTypeKey]) ? settings.main.hoverGroupBackgroundColorClass : ''}`}>{ovItem.createdBy}</td>
                                        <td onMouseEnter={() => onMouseEnter([ovItem.label.id], ovItem.label.id)} onMouseLeave={onMouseLeave}
                                            className={`whitespace-nowrap px-3 py-2 text-sm text-gray-500 ${(shouldHighLight(tmpHighlightIds, ovItem.shouldHighlightOn, headerHover.labelCollection) || hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.OVERVIEW_TABLE] && hoverGroupsDict[ovItem.label.id][ovItem.sourceTypeKey]) ? settings.main.hoverGroupBackgroundColorClass : ''}`}>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-sm font-medium cursor-default relative ${ovItem.label.backgroundColor} ${ovItem.label.textColor} ${ovItem.label.borderColor}`}>
                                                {ovItem.label.name}
                                                <div className={`label-overlay-base 
                                                    ${((shouldHighLight(tmpHighlightIds, [LabelSourceHover.MANUAL, ovItem.rla.id, ovItem.createdBy, ovItem.rla.labelingTaskLabel.labelingTask.id]) && ovItem.sourceTypeKey == LabelingPageParts.MANUAL) || (hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.MANUAL] && ovItem.sourceTypeKey == LabelingPageParts.MANUAL)) && style.labelOverlayManual} 
                                                    ${((shouldHighLight(tmpHighlightIds, [LabelSourceHover.WEAK_SUPERVISION, ovItem.rla.id, ovItem.createdBy, ovItem.rla.labelingTaskLabel.labelingTask.id]) && ovItem.sourceTypeKey == LabelingPageParts.WEAK_SUPERVISION) || (hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.WEAK_SUPERVISION] && ovItem.sourceTypeKey == LabelingPageParts.WEAK_SUPERVISION)) && style.labelOverlayWeakSupervision}
                                                    ${((shouldHighLight(tmpHighlightIds, [LabelSourceHover.INFORMATION_SOURCE, ovItem.rla.id, ovItem.createdBy, ovItem.rla.labelingTaskLabel.labelingTask.id]) && ovItem.sourceTypeKey == LabelingPageParts.INFORMATION_SOURCE) || (hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.INFORMATION_SOURCE] && ovItem.sourceTypeKey == LabelingPageParts.INFORMATION_SOURCE)) && style.labelOverlayHeuristic}
                                                    `}></div>
                                            </span>
                                            {ovItem.label.value && <div className="ml-2">{ovItem.label.value}</div>}
                                        </td>
                                        <td onMouseEnter={() => onMouseEnter([ovItem.rla.id])} onMouseLeave={onMouseLeave}
                                            className={`${(shouldHighLight(tmpHighlightIds, ovItem.shouldHighlightOn) || hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.OVERVIEW_TABLE] && hoverGroupsDict[ovItem.label.id][ovItem.sourceTypeKey]) ? settings.main.hoverGroupBackgroundColorClass : ''}`}>
                                            <IconSearch className="w-6 h-6 text-gray-700" />
                                        </td>
                                        <td onMouseEnter={() => onMouseEnter([ovItem.rla.id])} onMouseLeave={onMouseLeave}
                                            className={`${(shouldHighLight(tmpHighlightIds, ovItem.shouldHighlightOn) || hoverGroupsDict[ovItem.label.id] && hoverGroupsDict[ovItem.label.id][LabelingPageParts.OVERVIEW_TABLE] && hoverGroupsDict[ovItem.label.id][ovItem.sourceTypeKey]) ? settings.main.hoverGroupBackgroundColorClass : ''}`}>
                                            {ovItem.canBeDeleted && <div onClick={() => deleteLabelFromRecord(ovItem.rla.id)}>
                                                <IconTrash className="w-6 h-6 text-red-700 cursor-pointer" /></div>}
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
            {!settings.showHeuristics && dataHasHeuristics && user?.role == UserRole.ENGINEER && userDisplayRole == UserRole.ENGINEER && <p className="text-gray-500 p-5">Heuristics display is currently disabled</p>}
        </>)
        }
    </>)
}