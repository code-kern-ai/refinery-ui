import LoadingIcon from "@/src/components/shared/loading/LoadingIcon"
import { selectUser } from "@/src/reduxStore/states/general"
import { removeFromRlaById, selectDisplayUserRole, selectHoverGroupDict, selectRecordRequests, selectRecordRequestsRecord, selectSettings, selectTmpHighlightIds, selectUserDisplayId, setActiveTokenSelection, setHoverGroupDict, tmpAddHighlightIds } from "@/src/reduxStore/states/pages/labeling"
import { selectLabelingTasksAll, selectVisibleAttributesLabeling } from "@/src/reduxStore/states/pages/settings"
import { selectProjectId } from "@/src/reduxStore/states/project"
import { HotkeyLookup, LabelSourceHover, LabelingVars, TokenLookup } from "@/src/types/components/projects/projectId/labeling/labeling"
import { LabelingTaskTaskType } from "@/src/types/components/projects/projectId/settings/labeling-tasks"
import { UserRole } from "@/src/types/shared/sidebar"
import { DEFAULT_LABEL_COLOR, FULL_RECORD_ID, SWIM_LANE_SIZE_PX, buildLabelingRlaData, checkCanEditLabels, collectSelectionData, filterRlaDataForLabeling, findOrderPosItem, getDefaultLabelingVars, getFirstFitPos, getGoldInfoForTask, getOrderLookupItem, getOrderLookupSort, getTaskTypeOrder, getTokenData, parseSelectionData } from "@/src/util/components/projects/projectId/labeling/labeling-helper"
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants"
import { Tooltip } from "@nextui-org/react"
import { IconAlertCircle, IconAssembly, IconBolt, IconCode, IconSparkles, IconStar, IconUsers } from "@tabler/icons-react"
import { Fragment, useRef, useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import ExtractionDisplay from "./ExtractionDisplay"
import { LineBreaksType } from "@/src/types/components/projects/projectId/data-browser/data-browser"
import { jsonCopy } from "@/submodules/javascript-functions/general"
import { InformationSourceType, LabelSource } from "@/submodules/javascript-functions/enums/enums"
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { useMutation } from "@apollo/client"
import { ADD_CLASSIFICATION_LABELS_TO_RECORD, ADD_EXTRACTION_LABEL_TO_RECORD, REMOVE_GOLD_STAR_ANNOTATION_FOR_TASK, SET_GOLD_STAR_ANNOTATION_FOR_TASK } from "@/src/services/gql/mutations/labeling"
import { SessionManager } from "@/src/util/classes/labeling/session-manager"
import { GOLD_STAR_USER_ID } from "@/src/util/components/projects/projectId/labeling/labeling-main-component-helper"
import { useRouter } from "next/router"
import LabelSelectionBox from "./LabelSelectionBox"
import { filterRlaDataForUser } from "@/src/util/components/projects/projectId/labeling/overview-table-helper"
import { LabelingPageParts } from "@/src/types/components/projects/projectId/labeling/labeling-main-component"
import style from '@/src/styles/components/projects/projectId/labeling.module.css';
import { getStoreSnapshotValue } from "@/src/reduxStore/store"
import { createLabel } from "@/src/services/base/project-setting"
import { addClassificationLabels, deleteRecordLabelAssociationByIds } from "@/src/services/base/labeling"

const L_VARS = getDefaultLabelingVars();

export function shouldHighlightOn(tmpHighlightIds: string[], comparedId: string[]) {
    return tmpHighlightIds.some((id) => comparedId.includes(id));
}

export default function LabelingSuiteLabeling() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectVisibleAttributesLabeling);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const recordRequests = useSelector(selectRecordRequests);
    const settings = useSelector(selectSettings);
    const user = useSelector(selectUser);
    const record = useSelector(selectRecordRequestsRecord);
    const displayUserId = useSelector(selectUserDisplayId);
    const hoverGroupsDict = useSelector(selectHoverGroupDict);
    const tmpHighlightIds = useSelector(selectTmpHighlightIds);
    const userDisplayRole = useSelector(selectDisplayUserRole);

    const [lVars, setLVars] = useState<LabelingVars>(L_VARS);
    const [tokenLookup, setTokenLookup] = useState<TokenLookup>({});
    const [rlaDataToDisplay, setRlaDataToDisplay] = useState<{ [taskId: string]: any }>(null);
    const [fullRlaData, setFullRlaData] = useState<any[]>([]);
    const [canEditLabels, setCanEditLabels] = useState<boolean>(false);
    const [labelLookup, setLabelLookup] = useState<any>({});
    const [labelAddButtonDisabledDict, setLabelAddButtonDisabledDict] = useState<{ [taskId: string]: boolean }>({});
    const [activeTasks, setActiveTasks] = useState<any[]>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [labelHotkeys, setLabelHotkeys] = useState<HotkeyLookup>({});

    const extractionRef = useRef(null);

    const [addExtractionLabelToRecordMut] = useMutation(ADD_EXTRACTION_LABEL_TO_RECORD);
    const [setGoldStarMut] = useMutation(SET_GOLD_STAR_ANNOTATION_FOR_TASK);
    const [removeGoldStarMut] = useMutation(REMOVE_GOLD_STAR_ANNOTATION_FOR_TASK);

    useEffect(() => {
        if (!projectId || !attributes || !recordRequests || !user || !settings || !userDisplayRole || !labelingTasks) return;
        attributesChanged();
        prepareRlaData();
        rebuildGoldInfo();
    }, [projectId, attributes, recordRequests, user, settings, userDisplayRole, labelingTasks]);

    useEffect(() => {
        if (!labelingTasks || !lVars) return;
        rebuildLabelLookup();
        rebuildTaskLookup(lVars);
        rebuildHotkeyLookup();
    }, [labelingTasks, lVars]);

    useEffect(() => {
        if (!lVars || !fullRlaData || !recordRequests || !rlaDataToDisplay || !userDisplayRole) return;
        prepareRlaTokenLookup();
        rebuildGoldInfo();
    }, [lVars, fullRlaData, recordRequests, rlaDataToDisplay, userDisplayRole]);

    useEffect(() => {
        if (!displayUserId) return;
        if (!fullRlaData) return;
        filterRlaDataForCurrent();
        rebuildGoldInfo();
    }, [displayUserId, fullRlaData, userDisplayRole]);

    useEffect(() => {
        const handleMouseDown = (event) => {
            setActiveTasksFuncRef.current([]);
        };
        window.addEventListener('mousedown', handleMouseDown);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    useEffect(() => {
        if (!labelHotkeys || !tokenLookup) return;
        document.addEventListener('keyup', handleKeyboardEvent);
        return () => {
            document.removeEventListener('keyup', handleKeyboardEvent);
        };
    }, [labelHotkeys, tokenLookup]);

    useEffect(() => {
        if (!tokenLookup || !extractionRef.current) return;
        const handleMouseUp = (e) => {
            const [check, attributeIdStart, tokenStart, tokenEnd, startEl] = parseSelectionData();
            dispatch(setActiveTokenSelection({ attributeId: attributeIdStart, tokenStart, tokenEnd }));
            if (!check) {
                clearSelected();
            } else {
                window.getSelection().empty();
                setSelected(attributeIdStart, tokenStart, tokenEnd, startEl);
            }
        };
        extractionRef.current.addEventListener('mouseup', handleMouseUp);
        return () => {
            extractionRef.current?.removeEventListener('mouseup', handleMouseUp);
        };
    }, [tokenLookup]);

    useEffect(() => {
        if (!settings || !lVars || !labelingTasks) return;
        rebuildTaskLookup(lVars);
        filterRlaDataForCurrent();
    }, [settings, lVars, labelingTasks]);

    useEffect(() => {
        if (!user || !displayUserId || !userDisplayRole) return;
        setCanEditLabels(checkCanEditLabels(user, userDisplayRole, displayUserId));
    }, [user, displayUserId, userDisplayRole]);

    function attributesChanged() {
        if (!attributes) return;
        const lVarsCopy = { ...lVars };
        lVarsCopy.loopAttributes = Array(attributes.length + 1);
        lVarsCopy.loading = !(recordRequests.record && recordRequests.token && recordRequests.rla);
        let i = 0;
        for (const attribute of attributes) {
            lVarsCopy.loopAttributes[i++] = attribute;
        }
        lVarsCopy.loopAttributes[i++] = {
            name: "Full Record",
            id: FULL_RECORD_ID,
            relativePosition: 9999,
        }
        rebuildTaskLookup(lVarsCopy);
    }

    function rebuildTaskLookup(lVarsCopy: LabelingVars) {
        if (!labelingTasks || !attributes) return;
        if (!recordRequests.record || !recordRequests.token || !recordRequests.rla) return;
        if (!lVarsCopy.loopAttributes) return;
        lVarsCopy.taskLookup = {};
        for (const attribute of attributes) {
            lVarsCopy.taskLookup[attribute.id] = {
                lookup: [],
                attribute: attribute,
            };
        }
        lVarsCopy.taskLookup[FULL_RECORD_ID] = {
            lookup: [],
            attribute: null,
        };
        for (const task of labelingTasks) {
            const attributeKey = task.attribute ? task.attribute.id : FULL_RECORD_ID;
            const taskCopy = { ...task };
            taskCopy.displayLabels = task.labels.slice(0, settings.labeling.showNLabelButton);
            lVarsCopy.taskLookup[attributeKey].lookup.push({
                showText: false,
                orderKey: getTaskTypeOrder(task.taskType),
                task: taskCopy,
                showGridLabelPart: true,
                tokenData: getTokenData(attributeKey, attributes, recordRequests),
            });
        }
        if (lVarsCopy.taskLookup[FULL_RECORD_ID].lookup.length == 0) {
            delete lVarsCopy.taskLookup[FULL_RECORD_ID];
            lVarsCopy.loopAttributes = lVarsCopy.loopAttributes.filter(a => a.id != FULL_RECORD_ID);
        }
        for (const key in lVarsCopy.taskLookup) {
            if (lVarsCopy.taskLookup[key].lookup.length == 0) {
                lVarsCopy.taskLookup[key].lookup.push({
                    showText: true,
                    orderKey: 0,
                    showGridLabelPart: true,

                    task: {
                        taskType: LabelingTaskTaskType.NOT_USEABLE,
                        name: "No Task",
                    }
                });
            } else {
                lVarsCopy.taskLookup[key].lookup.sort((a, b) => a.orderKey - b.orderKey || a.task.name.localeCompare(b.task.name));
                lVarsCopy.taskLookup[key].lookup[0].showText = !!lVarsCopy.taskLookup[key].attribute;
                if (lVarsCopy.taskLookup[key].lookup[0].task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION) {
                    const extractionTasks = lVarsCopy.taskLookup[key].lookup.filter(t => t.task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION);
                    for (const t of extractionTasks) t.showGridLabelPart = false;

                    lVarsCopy.taskLookup[key].lookup[0].showGridLabelPart = true;
                    lVarsCopy.taskLookup[key].lookup[0].gridRowSpan = "span " + extractionTasks.length;
                }
            }
        }
        setLVars(lVarsCopy);
        if (activeTasks) {
            const activeTaskIds = activeTasks.map(x => x.task.id);
            for (const key in lVars.taskLookup) {
                const found = lVars.taskLookup[key].lookup.filter(t => activeTaskIds.includes(t.task.id));
                if (found.length != 0) {
                    setActiveTasksFuncRef.current(found);
                    break;
                }
            }
        }
    }

    function rebuildHotkeyLookup() {
        const labelHotkeysCopy = { ...labelHotkeys };
        labelingTasks.forEach(task => {
            task.labels.forEach(l => {
                if (l.hotkey) labelHotkeysCopy[l.hotkey] = { taskId: task.id, labelId: l.id };
            });
        });
        setLabelHotkeys(labelHotkeysCopy);
    }

    const setActiveTasksFunc = useCallback((tasks: any | any[]) => {
        if (!canEditLabels && user?.role != UserRole.ANNOTATOR && userDisplayRole != UserRole.ANNOTATOR) {
            if (activeTasks) setActiveTasks([]);
            return;
        }
        if (Array.isArray(tasks)) {
            setActiveTasks(tasks);
        } else {
            setActiveTasks([tasks]);
        }
        checkLabelVisibleInSearch(labelLookup);
    }, [canEditLabels, user, activeTasks, userDisplayRole, labelLookup]);

    const setActiveTasksFuncRef = useRef(null);
    useEffect(() => { setActiveTasksFuncRef.current = setActiveTasksFunc }, [setActiveTasksFunc]);



    function toggleGoldStar(taskId: string, currentState: boolean) {
        if (currentState) {
            removeTaskAsGoldStar(taskId);
        } else {
            selectTaskAsGoldStar(taskId, displayUserId);
        }
    }

    function selectTaskAsGoldStar(taskId: string, userId: string) {
        if (!recordRequests.record.id) return;
        LabelingSuiteManager.somethingLoading = true;
        setGoldStarMut({ variables: { projectId: projectId, recordId: recordRequests.record.id, goldUserId: userId, labelingTaskId: taskId } }).then(res => {
        });
    }

    function removeTaskAsGoldStar(taskId: string) {
        if (!recordRequests.record.id) return;
        LabelingSuiteManager.somethingLoading = true;
        removeGoldStarMut({ variables: { projectId: projectId, recordId: recordRequests.record.id, labelingTaskId: taskId } }).then(res => {
        });
    }

    function rebuildGoldInfo() {
        if (!lVars?.taskLookup || !fullRlaData) return;
        for (const attributeId in lVars.taskLookup) {
            for (const task of lVars.taskLookup[attributeId].lookup) {
                task.goldInfo = getGoldInfoForTask(task, user, fullRlaData, displayUserId, userDisplayRole);
            }
        }
    }

    function prepareRlaData() {
        if (!recordRequests.rla) return;
        const fullDataData = buildLabelingRlaData(recordRequests.rla, user, settings.labeling.showHeuristicConfidence, userDisplayRole);
        setFullRlaData(fullDataData);
    }

    function filterRlaDataForCurrent() {
        if (!fullRlaData) return;

        let filtered = fullRlaData;
        filtered = filterRlaDataForUser(filtered, user, displayUserId, userDisplayRole, 'rla');
        filtered = filterRlaDataForLabeling(filtered, settings, projectId, 'rla');
        const rlaDataToDisplayCopy = {};
        for (const rla of filtered) {
            if (!rlaDataToDisplayCopy[rla.taskId]) rlaDataToDisplayCopy[rla.taskId] = [];
            rlaDataToDisplayCopy[rla.taskId].push(rla);
        }
        setRlaDataToDisplay(rlaDataToDisplayCopy);
    }

    function prepareRlaTokenLookup() {
        if (!lVars.loopAttributes || !rlaDataToDisplay || !recordRequests.token) return;
        const orderLookup = {};
        const tokenLookupCopy = {};
        for (const attribute of lVars.loopAttributes) {
            let taskList = lVars.taskLookup[attribute.id].lookup;
            taskList = taskList.filter(t => t.task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION);
            if (taskList.length == 0) continue;
            tokenLookupCopy[attribute.id] = { token: recordRequests.token.attributes?.find((a) => a.attributeId == attribute.id)?.token };
            for (const task of taskList) {
                const rlas = rlaDataToDisplay[task.task.id];
                if (!rlas) continue;
                for (const rla of rlas) {
                    if (!orderLookup[attribute.id]) orderLookup[attribute.id] = [];
                    const orderPos = getFirstFitPos(tokenLookupCopy[attribute.id], rla.rla.tokenStartIdx, rla.rla.tokenEndIdx, settings.labeling.swimLaneExtractionDisplay);
                    orderLookup[attribute.id].push(getOrderLookupItem(rla.rla));
                    for (let tokenIdx = rla.rla.tokenStartIdx; tokenIdx <= rla.rla.tokenEndIdx; tokenIdx++) {
                        if (!tokenLookupCopy[attribute.id][tokenIdx]) tokenLookupCopy[attribute.id][tokenIdx] = { rlaArray: [], tokenMarginBottom: null };
                        tokenLookupCopy[attribute.id][tokenIdx].rlaArray.push({
                            orderPos: orderPos,
                            bottomPos: null,
                            isFirst: tokenIdx == rla.rla.tokenStartIdx,
                            isLast: tokenIdx == rla.rla.tokenEndIdx,
                            hoverGroups: rla.hoverGroups,
                            labelId: rla.rla.labelingTaskLabelId,
                            canBeDeleted: rla.canBeDeleted,
                            rla: rla.rla
                        });
                    }
                }
            }
        }
        //build order logic
        for (const attributeId in orderLookup) {
            //ensure unique
            orderLookup[attributeId] = [...new Map(orderLookup[attributeId].map(v => [JSON.stringify(v), v])).values()]
            //sort
            orderLookup[attributeId].sort((a, b) => getOrderLookupSort(a, b));
            //set position
            let pos = 0;
            for (const item of orderLookup[attributeId]) {
                item.orderPos = ++pos;
            }
        }

        for (const attributeId in tokenLookupCopy) {
            for (const tokenIdx in tokenLookupCopy[attributeId]) {
                if (tokenIdx == 'token') continue;
                for (const rla of tokenLookupCopy[attributeId][tokenIdx].rlaArray) {
                    if (rla.orderPos == -1) {
                        const orderLookupItem = getOrderLookupItem(rla.rla);
                        const foundPosItem = orderLookup[attributeId].find(e => findOrderPosItem(e, orderLookupItem));
                        if (foundPosItem) {
                            rla.orderPos = foundPosItem.orderPos;
                        }
                    }
                    rla.bottomPos = ((SWIM_LANE_SIZE_PX * rla.orderPos) * -1) + 'px';
                }
                //order reverse so hover elements work with z index as expected
                tokenLookupCopy[attributeId][tokenIdx].rlaArray.sort((a, b) => b.orderPos - a.orderPos);
                const maxPos = Math.max(...tokenLookupCopy[attributeId][tokenIdx].rlaArray.map(e => e.orderPos));
                if (maxPos) {
                    tokenLookupCopy[attributeId][tokenIdx].tokenMarginBottom = (SWIM_LANE_SIZE_PX * maxPos) + 5 + 'px';
                }
            }
        }
        setTokenLookup(tokenLookupCopy);
    }

    function rebuildLabelLookup() {
        const labelLookupCopy = { ...labelLookup };
        for (const task of labelingTasks) {
            for (const label of task.labels) {
                labelLookupCopy[label.id] = {
                    label: label,
                    visibleInSearch: true,
                    task: task,
                    color: label.color
                };
            }
        }
        checkLabelVisibleInSearch(labelLookupCopy);
        setLabelLookup(labelLookupCopy);
    }

    function checkLabelVisibleInSearch(labelLookupCopy: any, searchValue?: string, activeTask?: any) {
        if (!labelLookupCopy) return;
        for (const labelId in labelLookupCopy) {
            const label = labelLookupCopy[labelId];
            if (activeTask && label.task.id != activeTask.id) continue;
            if (searchValue) {
                label.visibleInSearch = label.label.name.toLowerCase().includes(searchValue.toLowerCase());
            } else {
                if (label.task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION) {
                    label.visibleInSearch = true;
                } else {
                    label.visibleInSearch = !label.task.displayLabels?.find(x => x.id == labelId);
                }
            }
        }
        checkDisableLabelAddButton(searchValue, activeTask);
    }

    function checkDisableLabelAddButton(labelName: string, activeTask: any) {
        const labelAddButtonDisabledDictCopy = { ...labelAddButtonDisabledDict };
        if (!labelName || !activeTask) {
            labelingTasks?.forEach(task => labelAddButtonDisabledDictCopy[task.id] = true);
            setLabelAddButtonDisabledDict(labelAddButtonDisabledDictCopy);
        }
        else {
            for (const [key, value] of activeTask.labels.entries()) {
                if (value.name.toLowerCase() == labelName) {

                    labelAddButtonDisabledDictCopy[activeTask.id] = true;
                    setLabelAddButtonDisabledDict(labelAddButtonDisabledDictCopy);
                    return;
                }
            }
            labelAddButtonDisabledDictCopy[activeTask.id] = false;
            setLabelAddButtonDisabledDict(labelAddButtonDisabledDictCopy);
        }
    }

    function addRla(task: any, labelId: string) {
        if (!canEditLabels || !task) return;
        if (task.taskType == LabelingTaskTaskType.MULTICLASS_CLASSIFICATION) {
            addLabelToTask(task.id, labelId);
        } else {
            addLabelToSelection(task.attribute.id, task.id, labelId);
        }
        if (settings.labeling.closeLabelBoxAfterLabel) {
            setActiveTasksFuncRef.current([]);
            clearSelected();
        }
    }

    function deleteRecordLabelAssociation(rlaId: string) {
        deleteRecordLabelAssociationByIds(projectId, record.id, [rlaId], () => {
            dispatch(removeFromRlaById(rlaId));
        });
    }

    function addLabelToTask(labelingTaskId: string, labelId: string) {
        if (!canEditLabels) return;
        if (!fullRlaData) return;

        const existingLabels = fullRlaData.filter(e =>
            e.sourceTypeKey == LabelSource.MANUAL && e.createdBy == displayUserId && e.labelId == labelId);

        if (existingLabels.length == 1) return;
        const sourceId = SessionManager.getSourceId();
        const asGoldStar = displayUserId == GOLD_STAR_USER_ID ? true : null;
        addClassificationLabels(projectId, record.id, labelingTaskId, labelId, asGoldStar, sourceId, () => {
            if (settings.main.autoNextRecord) {
                SessionManager.nextRecord();
                SessionManager.currentRecordId = SessionManager.huddleData.recordIds[SessionManager.huddleData.linkData.requestedPos - 1];
                router.push(`/projects/${projectId}/labeling/${SessionManager.labelingLinkData.huddleId}?pos=${SessionManager.huddleData.linkData.requestedPos}&type=${SessionManager.huddleData.linkData.linkType}`);
            }
        });
    }

    function addLabelToSelection(attributeId: string, labelingTaskId: string, labelId: string) {

        const currentSelection = getStoreSnapshotValue(['labeling', 'activeTokenSelection']);
        const selectionData = collectSelectionData(attributeId, currentSelection, attributes, recordRequests);
        if (!selectionData) return;
        const sourceId = SessionManager.getSourceId();
        addExtractionLabelToRecordMut({ variables: { projectId: projectId, recordId: record.id, labelingTaskId: labelingTaskId, labelId: labelId, tokenStartIndex: selectionData.startIdx, tokenEndIndex: selectionData.endIdx, value: selectionData.value, sourceId: sourceId } }).then((res) => { });
    }

    const clearSelected = useCallback(() => {
        dispatch(setActiveTokenSelection(null));
    }, [tokenLookup]);

    function setSelected(attributeId: string, tokenStart: number, tokenEnd: number, e?: any) {
        if (!canEditLabels && user.role != UserRole.ANNOTATOR && userDisplayRole != UserRole.ANNOTATOR) return;
        const tokenLookupCopy = jsonCopy(tokenLookup);
        if (!tokenLookupCopy[attributeId]) {
            labelBoxPosition(e);
            return;
        }
        dispatch(setActiveTokenSelection({ attributeId, tokenStart, tokenEnd }));
        if (lVars.taskLookup[attributeId].lookup[0].task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION) {
            const extractionTasks = lVars.taskLookup[attributeId].lookup.filter(t => t.task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION);
            setActiveTasksFuncRef.current(extractionTasks);
        } else {
            setActiveTasksFuncRef.current(lVars.taskLookup[attributeId].lookup);
        }
        setTokenLookup(tokenLookupCopy);
        labelBoxPosition(e);
    }

    function labelBoxPosition(e) {
        const labelBox: DOMRect = e.target?.getBoundingClientRect();
        if (!labelBox) return;
        const baseBox: DOMRect = document.getElementById('base-dom-element')?.getBoundingClientRect();
        if (!baseBox) return;
        const posTop = (labelBox.top + labelBox.height - baseBox.top + 10);
        const posLeft = (labelBox.left - baseBox.left);
        setPosition({ top: posTop, left: posLeft });
    }

    function addNewLabelToTask(newLabel: string, task: any) {
        createLabel(projectId, newLabel, task.id, DEFAULT_LABEL_COLOR, () => {
            rebuildLabelLookup();
        });
    }

    function handleKeyboardEvent(event) {
        const labelSelection = document.getElementById('label-selection-box');
        if (event.key == 'ArrowRight' || event.key == 'ArrowLeft') {
            setActiveTasksFuncRef.current([]);
        }
        if (labelSelection && !labelSelection.classList.contains('hidden')) return;
        for (const key in labelHotkeys) {
            if (key == event.key) {
                const task = labelingTasks.find(t => t.id == labelHotkeys[key].taskId);
                addRla(task, labelHotkeys[key].labelId);
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
    }


    function onMouseEvent(update: boolean, labelId: string) {
        let hoverGroupsDictCopy = {};
        if (!hoverGroupsDictCopy[labelId] && update) {
            hoverGroupsDictCopy[labelId] = {
                [LabelingPageParts.TASK_HEADER]: true
            }
            dispatch(setHoverGroupDict(hoverGroupsDictCopy));
        } else {
            dispatch(setHoverGroupDict(null));
        }
    }

    return (<div id="base-dom-element" className="bg-white relative p-4">
        {lVars.loading && SessionManager.currentRecordId !== "deleted" && <LoadingIcon size="lg" />}
        {(!lVars.loading && tokenLookup && !recordRequests.record || SessionManager.currentRecordId == "deleted") && <div className="flex items-center justify-center text-red-500">This Record has been deleted</div>}

        {recordRequests.record && !lVars.loading && lVars.loopAttributes && SessionManager.currentRecordId !== "deleted" && <div className="grid w-full border md:rounded-lg items-center" style={{ gridTemplateColumns: 'max-content max-content 40px auto' }}>
            {lVars.loopAttributes.map((attribute, i) => (<Fragment key={attribute.id}>
                {lVars.taskLookup[attribute.id].lookup.map((task, j) => (<Fragment key={j}>
                    <div className={`font-dmMono text-sm font-bold text-gray-500 py-2 pl-4 pr-3 sm:pl-6 col-start-1 h-full ${i % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        {j == 0 ? attribute.name : ''}
                    </div>
                    {settings.labeling.showTaskNames && user.role != UserRole.ANNOTATOR && userDisplayRole != UserRole.ANNOTATOR && <div className={`col-start-2 pr-3 py-1.5 h-full flex ${i % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        {task.task.taskType != LabelingTaskTaskType.NOT_USEABLE ? task.task.name : ''}
                    </div>}
                    <div className={`col-start-3 h-full py-1.5 flex ${i % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        {task.goldInfo?.can && <Tooltip content={task.goldInfo.is ? TOOLTIPS_DICT.LABELING.REMOVE_LABELS_GOLD_STAR : TOOLTIPS_DICT.LABELING.SET_LABELS_GOLD_STAR} color="invert" placement="top">
                            <div className="mt-0.5" onClick={() => toggleGoldStar(task.task.id, task.goldInfo?.is)}>
                                <IconStar className={`${task.goldInfo.is ? style.specialUserActive : style.specialUserInActive}`} />
                            </div>
                        </Tooltip>}
                    </div>
                    {task.showGridLabelPart && <div className={`col-start-4 h-full py-1 ${i % 2 == 0 ? 'bg-white' : 'bg-gray-50'}`} style={{ gridRow: task.gridRowSpan }}>
                        <div className="flex flex-col gap-y-2">
                            {task.showText && <>
                                {task.task.taskType == LabelingTaskTaskType.INFORMATION_EXTRACTION ? (<ExtractionDisplay ref={extractionRef} attributeId={attribute.id} tokenLookup={tokenLookup} labelLookup={labelLookup}
                                    deleteRla={(rlaId) => {
                                        deleteRecordLabelAssociation(rlaId);
                                        setActiveTasksFuncRef.current([]);
                                    }}
                                    setSelected={(start, end, e) => setSelected(attribute.id, start, end, e)} />) : (<>
                                        {(recordRequests.record.data[lVars.taskLookup[attribute.id].attribute.name] != null && recordRequests.record.data[lVars.taskLookup[attribute.id].attribute.name] !== '') ?
                                            (<p className={`break-words text-sm leading-5 font-normal text-gray-500 ${settings.main.lineBreaks != LineBreaksType.NORMAL ? (settings.main.lineBreaks == LineBreaksType.IS_PRE_WRAP ? 'whitespace-pre-wrap' : 'whitespace-pre-line') : ''}`}>
                                                {`${recordRequests.record.data[lVars.taskLookup[attribute.id].attribute.name]}`}
                                            </p>) : (<>
                                                <IconAlertCircle className="text-yellow-700 inline-block h-5 w-5" />
                                                <span className="text-gray-500 text-sm font-normal italic">Not present in the
                                                    record</span>
                                            </>)}
                                    </>)}
                            </>}
                            {task.task.taskType == LabelingTaskTaskType.MULTICLASS_CLASSIFICATION && <>
                                {(canEditLabels || user.role == UserRole.ANNOTATOR || user.role == UserRole.EXPERT || userDisplayRole == UserRole.ANNOTATOR || userDisplayRole == UserRole.EXPERT) && <div className="flex flex-row flex-wrap gap-2">
                                    {task.task.displayLabels.map((label, index) => (<div key={index} onClick={() => addRla(task.task, label.id)}
                                        className={`text-sm font-medium px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer  ${labelLookup[label.id]?.color.backgroundColor} ${labelLookup[label.id]?.color.textColor} ${labelLookup[label.id]?.color.borderColor}`}>
                                        <div className="truncate" style={{ maxWidth: '260px' }}>{label.name}
                                            {label.hotkey && <kbd className="ml-1 uppercase inline-flex items-center border bg-white border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">{label.hotkey}</kbd>}
                                        </div>
                                    </div>))}
                                    <Tooltip content={TOOLTIPS_DICT.LABELING.CHOOSE_LABELS} color="invert" placement="top">
                                        <button onClick={(event) => {
                                            setActiveTasksFuncRef.current(task);
                                            labelBoxPosition(event);
                                        }} className="flex flex-row flex-nowrap bg-white text-gray-700 text-sm font-medium mr-3 px-2 py-0.5 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                            <span>other</span>
                                            <span className="truncate mx-1" style={{ maxWidth: '9rem' }}>{task.task.name}</span>
                                            <span>options</span>
                                        </button>
                                    </Tooltip>
                                </div>
                                }
                                {rlaDataToDisplay[task.task.id] && <div>
                                    <div className={`flex gap-2 ${settings.labeling.compactClassificationLabelDisplay ? 'flex-row flex-wrap items-center' : 'flex-col'}`}>
                                        {rlaDataToDisplay[task.task.id].map((rlaLabel, index) => (<Tooltip key={index} content={rlaLabel.dataTip} color="invert" placement="top" className={`w-max ${rlaLabel.sourceTypeKey == LabelSourceHover.WEAK_SUPERVISION ? 'cursor-pointer' : 'cursor-default'}`}>
                                            <div onClick={() => rlaLabel.sourceTypeKey == 'WEAK_SUPERVISION' ? addRla(task.task, rlaLabel.labelId) : null}
                                                onMouseEnter={() => {
                                                    dispatch(tmpAddHighlightIds([rlaLabel.rla.id]));
                                                    onMouseEvent(true, rlaLabel.labelId);
                                                }}
                                                onMouseLeave={() => {
                                                    dispatch(tmpAddHighlightIds([]));
                                                    onMouseEvent(false, rlaLabel.labelId);
                                                }}
                                                className={`text-sm font-medium px-2 py-0.5 rounded-md border focus:outline-none relative flex items-center ${labelLookup[rlaLabel.labelId].color.backgroundColor} ${labelLookup[rlaLabel.labelId].color.textColor} ${labelLookup[rlaLabel.labelId].color.borderColor}`}>
                                                <div className={`label-overlay-base 
                                                    ${((shouldHighlightOn(tmpHighlightIds, [LabelSourceHover.MANUAL, rlaLabel.rla.id, rlaLabel.createdByName, rlaLabel.rla.labelingTaskLabel.labelingTask.id]) && rlaLabel.sourceTypeKey == LabelingPageParts.MANUAL) || (hoverGroupsDict[rlaLabel.labelId] && hoverGroupsDict[rlaLabel.labelId][LabelingPageParts.MANUAL] && rlaLabel.sourceTypeKey == LabelingPageParts.MANUAL)) && style.labelOverlayManual} 
                                                    ${((shouldHighlightOn(tmpHighlightIds, [LabelSourceHover.WEAK_SUPERVISION, rlaLabel.rla.id, rlaLabel.createdByName, rlaLabel.rla.labelingTaskLabel.labelingTask.id]) && rlaLabel.sourceTypeKey == LabelingPageParts.WEAK_SUPERVISION) || (hoverGroupsDict[rlaLabel.labelId] && hoverGroupsDict[rlaLabel.labelId][LabelingPageParts.WEAK_SUPERVISION] && rlaLabel.sourceTypeKey == LabelingPageParts.WEAK_SUPERVISION)) && style.labelOverlayWeakSupervision}
                                                    ${((shouldHighlightOn(tmpHighlightIds, [LabelSourceHover.INFORMATION_SOURCE, rlaLabel.rla.id, rlaLabel.createdByName, rlaLabel.rla.labelingTaskLabel.labelingTask.id]) && rlaLabel.sourceTypeKey == LabelingPageParts.INFORMATION_SOURCE) || (hoverGroupsDict[rlaLabel.labelId] && hoverGroupsDict[rlaLabel.labelId][LabelingPageParts.INFORMATION_SOURCE] && rlaLabel.sourceTypeKey == LabelingPageParts.INFORMATION_SOURCE)) && style.labelOverlayHeuristic}
                                                    `}></div>
                                                {rlaLabel.icon && <div className="mr-1">
                                                    {rlaLabel.icon == InformationSourceType.LABELING_FUNCTION && <IconCode size={20} strokeWidth={1.5} />}
                                                    {rlaLabel.icon == InformationSourceType.ACTIVE_LEARNING && <IconBolt size={20} strokeWidth={1.5} />}
                                                    {rlaLabel.icon == InformationSourceType.ZERO_SHOT && <IconSparkles size={20} strokeWidth={1.5} />}
                                                    {rlaLabel.icon == InformationSourceType.CROWD_LABELER && <IconUsers size={20} strokeWidth={1.5} />}
                                                    {rlaLabel.icon == LabelSourceHover.MODEL_CALLBACK && <IconBolt size={20} strokeWidth={1.5} />}
                                                    {rlaLabel.icon == LabelSourceHover.WEAK_SUPERVISION && <IconAssembly size={20} strokeWidth={1.5} />}
                                                </div>}
                                                <div className="truncate" style={{ maxWidth: '260px' }}>{rlaLabel.labelDisplay}</div>
                                                {rlaLabel.canBeDeleted && <div className="pl-1 cursor-pointer" onClick={() => deleteRecordLabelAssociation(rlaLabel.rla.id)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block stroke-current relative" style={{ top: '-1px' }} viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>}
                                            </div>
                                        </Tooltip>))}
                                    </div>
                                </div>}
                            </>}
                        </div>
                        <div className={activeTasks && activeTasks.length > 0 ? null : "hidden"}>
                            <LabelSelectionBox activeTasks={activeTasks} position={position} labelLookup={labelLookup} labelAddButtonDisabledDict={labelAddButtonDisabledDict}
                                clearSelected={clearSelected}
                                addRla={(task, labelId) => {
                                    addRla(task, labelId);
                                }}
                                addNewLabelToTask={(newLabel, task) => addNewLabelToTask(newLabel, task)}
                                checkLabelVisibleInSearch={(newLabel, task) => checkLabelVisibleInSearch(labelLookup, newLabel, task)}
                                labelHotkeys={labelHotkeys}
                            />
                        </div>
                    </div>}
                </Fragment>))}
            </Fragment>))}
        </div>}
    </div>)
}