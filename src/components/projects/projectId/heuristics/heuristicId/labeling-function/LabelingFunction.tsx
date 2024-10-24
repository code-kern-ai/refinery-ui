import { useRouter } from "next/router";
import HeuristicsLayout from "../shared/HeuristicsLayout";
import { useDispatch, useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { useCallback, useEffect, useState } from "react";
import { selectHeuristic, setActiveHeuristics, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { postProcessCurrentHeuristic, postProcessLastTaskLogs } from "@/src/util/components/projects/projectId/heuristics/heuristicId/heuristics-details-helper";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { selectVisibleAttributesHeuristics, selectLabelingTasksAll, setLabelingTasksAll, SELECT_LABELING_TASKS_ALL_SNAPSHOT_ACCESS } from "@/src/reduxStore/states/pages/settings";
import HeuristicsEditor from "../shared/HeuristicsEditor";
import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import HeuristicRunButtons from "../shared/HeuristicRunButtons";
import ContainerLogs from "@/src/components/shared/logs/ContainerLogs";
import HeuristicStatistics from "../shared/HeuristicStatistics";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";
import { Status } from "@/src/types/shared/statuses";
import { postProcessSampleRecords } from "@/src/util/components/projects/projectId/heuristics/heuristicId/labeling-functions-helper";
import SampleRecords from "./SampleRecords";
import { SampleRecord } from "@/src/types/components/projects/projectId/heuristics/heuristicId/labeling-function";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";
import CalculationProgress from "./CalculationProgress";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { selectAllUsers, selectOrganizationId, setBricksIntegrator, setComments } from "@/src/reduxStore/states/general";
import { CommentType } from "@/src/types/shared/comments";
import { CommentDataManager } from "@/src/util/classes/comments";
import BricksIntegrator from "@/src/components/shared/bricks-integrator/BricksIntegrator";
import { InformationSourceCodeLookup, InformationSourceExamples } from "@/src/util/classes/heuristics";
import { getInformationSourceTemplate } from "@/src/util/components/projects/projectId/heuristics/heuristics-helper";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { parseContainerLogsData } from "@/submodules/javascript-functions/logs-parser";
import { useWebsocket } from "@/submodules/react-components/hooks/web-socket/useWebsocket";
import { getAllComments } from "@/src/services/base/comment";
import { getLabelingTasksByProjectId } from "@/src/services/base/project";
import { getHeuristicByHeuristicId, getLabelingFunctionOn10Records, getPayloadByPayloadId, updateHeuristicPost } from "@/src/services/base/heuristic";
import { getStoreSnapshotValue } from "@/src/reduxStore/store";
import { Application, CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";

export default function LabelingFunction() {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const attributes = useSelector(selectVisibleAttributesHeuristics);
    const allUsers = useSelector(selectAllUsers);

    const [lastTaskLogs, setLastTaskLogs] = useState<string[]>([]);
    const [selectedAttribute, setSelectedAttribute] = useState<Attribute>(null);
    const [sampleRecords, setSampleRecords] = useState<SampleRecord>(null);
    const [displayLogWarning, setDisplayLogWarning] = useState<boolean>(false);
    const [isInitialLf, setIsInitialLf] = useState<boolean>(null);  //null as add state to differentiate between initial, not and unchecked
    const [checkUnsavedChanges, setCheckUnsavedChanges] = useState(false);
    const [runOn10IsRunning, setRunOn10IsRunning] = useState(false);
    const [justClickedRun, setJustClickedRun] = useState(false);
    const [canStartHeuristic, setCanStartHeuristic] = useState(true);

    useEffect(() => {
        if (!projectId) return;
        if (!router.query.heuristicId) return;
        refetchLabelingTasksAndProcess();
    }, [projectId, router.query.heuristicId]);

    useEffect(() => {
        if (!projectId) return;
        if (!labelingTasks) return;
        refetchCurrentHeuristicAndProcess();
    }, [labelingTasks]);

    useEffect(() => {
        if (!currentHeuristic) return;
        if (isInitialLf == null) setIsInitialLf(InformationSourceCodeLookup.isCodeStillTemplate(currentHeuristic.sourceCode) != null);
        refetchTaskByTaskIdAndProcess();
    }, [currentHeuristic, isInitialLf]);

    useEffect(() => {
        if (!projectId || allUsers.length == 0) return;
        setUpCommentsRequests();
    }, [allUsers, projectId]);

    function setUpCommentsRequests() {
        const requests = [];
        requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId });
        requests.push({ commentType: CommentType.LABELING_TASK, projectId: projectId });
        requests.push({ commentType: CommentType.HEURISTIC, projectId: projectId });
        requests.push({ commentType: CommentType.KNOWLEDGE_BASE, projectId: projectId });
        requests.push({ commentType: CommentType.LABEL, projectId: projectId });
        CommentDataManager.unregisterCommentRequests(CurrentPage.LABELING_FUNCTION);
        CommentDataManager.registerCommentRequests(CurrentPage.LABELING_FUNCTION, requests);
        const requestJsonString = CommentDataManager.buildRequestJSON();
        getAllComments(requestJsonString, (res) => {
            CommentDataManager.parseCommentData(res.data['getAllComments']);
            CommentDataManager.parseToCurrentData(allUsers);
            dispatch(setComments(CommentDataManager.currentDataOrder));
        });
    }

    function refetchCurrentHeuristicAndProcess() {
        getHeuristicByHeuristicId(projectId, router.query.heuristicId as string, (res) => {
            dispatch(setActiveHeuristics(postProcessCurrentHeuristic(res['data']['informationSourceBySourceId'], labelingTasks)));
        });
    }

    function refetchLabelingTasksAndProcess() {
        getLabelingTasksByProjectId(projectId, (res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function saveHeuristic(labelingTask: any) {
        const newCode = checkTemplateCodeChange(labelingTask);
        if (newCode) updateSourceCode(newCode, labelingTask.id);
        updateHeuristicPost(projectId, currentHeuristic.id, labelingTask.id, currentHeuristic.sourceCode, currentHeuristic.description, currentHeuristic.name, (res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { labelingTaskId: labelingTask.id, labelingTaskName: labelingTask.name, labels: labelingTask.labels }))
        });
    }

    function updateSourceCodeToDisplay(value: string) {
        const finalSourceCode = value.replace('def lf(record)', 'def ' + currentHeuristic.name + '(record)');
        dispatch(updateHeuristicsState(currentHeuristic.id, { sourceCodeToDisplay: finalSourceCode }));
    }

    function refetchTaskByTaskIdAndProcess() {
        if (currentHeuristic.lastTask == null) return;
        if (currentHeuristic.lastTask.state == Status.QUEUED) {
            setLastTaskLogs(["Task is queued for execution"]);
            return;
        }
        getPayloadByPayloadId(projectId, currentHeuristic.lastPayload.id, (res) => {
            setLastTaskLogs(postProcessLastTaskLogs((res['data']['payloadByPayloadId'])));
        });
    }

    function executeLabelingFunctionOn10Records() {
        setDisplayLogWarning(true);
        setRunOn10IsRunning(true);
        getLabelingFunctionOn10Records(projectId, currentHeuristic.id, (res) => {
            setRunOn10IsRunning(false);
            setSampleRecords(postProcessSampleRecords(res['data']['getLabelingFunctionOn10Records'], labelingTasks, currentHeuristic.labelingTaskId));
            setLastTaskLogs(parseContainerLogsData(res['data']['getLabelingFunctionOn10Records']['containerLogs']))
        });
    }

    function checkTemplateCodeChange(labelingTask) {
        if (!currentHeuristic) return;
        const template: InformationSourceExamples = InformationSourceCodeLookup.isCodeStillTemplate(currentHeuristic.sourceCode);
        if (template == null) return;
        const matching = labelingTasks.filter(e => e.id == labelingTask.id);
        const templateCode = getInformationSourceTemplate(matching, currentHeuristic.informationSourceType, null).code;
        const currentHeuristicCopy = { ...currentHeuristic };
        const regMatch = getPythonFunctionRegExMatch(currentHeuristicCopy.sourceCode);
        if (regMatch[2] !== currentHeuristicCopy.name) {
            currentHeuristicCopy.sourceCodeToDisplay = templateCode.replace(regMatch[2], currentHeuristicCopy.name);
        }
        return currentHeuristicCopy.sourceCodeToDisplay;
    }

    function updateSourceCode(value: string, labelingTaskId?: string) {
        var regMatch: any = getPythonFunctionRegExMatch(value);
        if (!regMatch) {
            console.log("Can't find python function name -- seems wrong -- better dont save");
            return;
        }
        const finalSourceCode = value.replace(regMatch[0], 'def lf(record)');
        updateHeuristicPost(projectId, currentHeuristic.id, labelingTaskId ?? currentHeuristic.labelingTaskId, finalSourceCode, currentHeuristic.description, regMatch[2], (res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { sourceCode: finalSourceCode, name: regMatch[2] }));
            updateSourceCodeToDisplay(finalSourceCode);
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (!currentHeuristic) return;
        if (['labeling_task_updated', 'labeling_task_created', 'label_created', 'label_deleted'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else if ('labeling_task_deleted' == msgParts[1] && currentHeuristic.labelingTaskId == msgParts[2]) {
            alert('Parent labeling task was deleted!');
            router.push(`/projects/${projectId}/heuristics`);
        } else if ('information_source_deleted' == msgParts[1] && currentHeuristic.id == msgParts[2]) {
            alert('Information source was deleted!');
            router.push(`/projects/${projectId}/heuristics`);
        } else if (['information_source_updated', 'model_callback_update_statistics'].includes(msgParts[1])) {
            if (currentHeuristic.id == msgParts[2]) {
                refetchCurrentHeuristicAndProcess();
            }
        } else if (msgParts[1] == 'payload_progress') {
            if (msgParts[2] != currentHeuristic.id) return;
            dispatch(updateHeuristicsState(currentHeuristic.id, { lastTask: { progress: Number(msgParts[4]), state: Status.CREATED, iteration: currentHeuristic.lastPayload.iteration } }))
        } else {
            if (msgParts[2] != currentHeuristic.id) return;
            refetchCurrentHeuristicAndProcess();
            if (msgParts[1] == 'payload_finished' || msgParts[1] == 'payload_failed' || msgParts[1] == 'payload_created') {
                refetchTaskByTaskIdAndProcess();
            }
        }
    }, [currentHeuristic]);


    const setValueToLabelingTask = useCallback((value: string) => {
        const labelingTask = labelingTasks.find(a => a.id == value);
        const updateHeuristic = (labelingTasks: any[], maxI: number, task?: any) => {
            const labelingTask = task || labelingTasks.find(a => a.id == value);
            if (!labelingTask && maxI > 0) {
                setTimeout(() => updateHeuristic(getStoreSnapshotValue(SELECT_LABELING_TASKS_ALL_SNAPSHOT_ACCESS), maxI - 1), 100);
            } else {
                updateHeuristicPost(projectId, currentHeuristic.id, labelingTask.id, currentHeuristic.sourceCode, currentHeuristic.description, currentHeuristic.name, (res) => {
                    dispatch(updateHeuristicsState(currentHeuristic.id, { labelingTaskId: labelingTask.id, labelingTaskName: labelingTask.name, labels: labelingTask.labels }))
                });
            }
        }
        if (!labelingTask) {
            //try timeout as this is usually caused by race condition (creating the task+label through the integrator)
            setTimeout(() => updateHeuristic(getStoreSnapshotValue(SELECT_LABELING_TASKS_ALL_SNAPSHOT_ACCESS), 5), 100);
        } else updateHeuristic(labelingTasks, 0, labelingTask);
    }, [projectId, currentHeuristic, labelingTasks])

    const orgId = useSelector(selectOrganizationId);
    useWebsocket(orgId, Application.REFINERY, CurrentPage.LABELING_FUNCTION, handleWebsocketNotification, projectId);

    return (
        <HeuristicsLayout updateSourceCode={(code: string) => updateSourceCodeToDisplay(code)}>
            {currentHeuristic && <div>
                <div className="relative flex-shrink-0 min-h-16 flex justify-between pb-2">
                    <div className="flex items-center flex-wrap mt-3">
                        <div className="text-sm leading-5 font-medium text-gray-700 inline-block mr-2">Editor</div>
                        <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.LABELING_TASK} color="invert" placement="top">
                            <KernDropdown options={labelingTasks} buttonName={currentHeuristic?.labelingTaskName} selectedOption={(option: any) => saveHeuristic(option)} dropdownClasses="z-30" />

                        </Tooltip>
                        {currentHeuristic.labels?.length == 0 ? (<div className="text-sm font-normal text-gray-500 ml-3">No labels for target task</div>) : <>
                            {currentHeuristic.labels?.map((label: any, index: number) => (
                                <Tooltip content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert" placement="top" key={label.name}>
                                    <span onClick={() => copyToClipboard(label.name)}
                                        className={`inline-flex border items-center px-2 py-0.5 rounded text-xs font-medium cursor-pointer ml-3 ${label.color.backgroundColor} ${label.color.hoverColor} ${label.color.textColor} ${label.color.borderColor}`}>
                                        {label.name}
                                    </span>
                                </Tooltip>
                            ))}
                        </>}
                    </div>
                    <div className="flex items-center justify-center flex-shrink-0">
                        <div className="flex flex-row flex-nowrap items-center ml-auto">
                            <BricksIntegrator
                                moduleTypeFilter={currentHeuristic.labelingTaskType == 'MULTICLASS_CLASSIFICATION' ? 'classifier' : 'extractor'}
                                executionTypeFilter="pythonFunction,premium"
                                functionType="Heuristic"
                                labelingTaskId={currentHeuristic.labelingTaskId}
                                preparedCode={(code: string) => {
                                    updateSourceCode(code);
                                    setIsInitialLf(false);
                                }}
                                newTaskId={(value) => setValueToLabelingTask(value)}
                            />

                            <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.INSTALLED_LIBRARIES} color="invert" placement="left">
                                <a href="https://github.com/code-kern-ai/refinery-lf-exec-env/blob/dev/requirements.txt"
                                    target="_blank"
                                    className="bg-white text-gray-700 text-xs font-semibold ml-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                    See installed libraries
                                </a>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <HeuristicsEditor
                    isInitial={isInitialLf}
                    updatedSourceCode={(code: string) => updateSourceCode(code)}
                    setIsInitial={(val: boolean) => setIsInitialLf(val)}
                    setCheckUnsavedChanges={(val: boolean) => setCheckUnsavedChanges(val)} />

                <div className="mt-2 flex flex-grow justify-between items-center float-right">
                    <div className="flex items-center">
                        {runOn10IsRunning && <div className="flex items-center ml-2">
                            <LoadingIcon color="indigo" />
                        </div>}
                        {checkUnsavedChanges && <div className="flex items-center ml-2">
                            <div className="text-sm font-normal">Saving...</div>
                            <LoadingIcon color="indigo" />
                        </div>}
                        <div className="flex items-center mr-2">
                            <KernDropdown options={attributes} buttonName={selectedAttribute ? selectedAttribute.name : 'Select display attribute'} buttonClasses="text-xs font-semibold actionsHeight"
                                selectedOption={(option: any) => setSelectedAttribute(option)} />
                        </div>
                        <Tooltip content={selectedAttribute == null ? TOOLTIPS_DICT.LABELING_FUNCTION.SELECT_ATTRIBUTE : TOOLTIPS_DICT.LABELING_FUNCTION.RUN_ON_10} color="invert" placement="left">
                            <button disabled={selectedAttribute == null || runOn10IsRunning || justClickedRun || !canStartHeuristic} onClick={executeLabelingFunctionOn10Records}
                                className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                                Run on 10
                            </button>
                        </Tooltip>
                        <HeuristicRunButtons updateDisplayLogWarning={val => setDisplayLogWarning(val)} runOn10IsRunning={runOn10IsRunning} justClickedRun={(justClickedRun) => setJustClickedRun(justClickedRun)} checkCanStartHeuristic={(val) => setCanStartHeuristic(val)} />
                    </div>
                </div>
                {sampleRecords && sampleRecords.records.length > 0 && !sampleRecords.codeHasErrors && <>
                    <SampleRecords sampleRecords={sampleRecords} selectedAttribute={selectedAttribute.name} />
                    {displayLogWarning && <div className="text-sm inline-block font-normal text-gray-500 italic">
                        This is a temporary log from your last &quot;Run on 10&quot; execution. It will vanish once you leave/reload the page or &quot;Run&quot; the heuristic.
                    </div>}
                </>}

                <ContainerLogs logs={lastTaskLogs} type="heuristic" />

                <CalculationProgress />

                <HeuristicStatistics />

                <DangerZone elementType={DangerZoneEnum.LABELING_FUNCTION} id={currentHeuristic.id} name={currentHeuristic.name} />

            </div>}

        </HeuristicsLayout >
    )
}