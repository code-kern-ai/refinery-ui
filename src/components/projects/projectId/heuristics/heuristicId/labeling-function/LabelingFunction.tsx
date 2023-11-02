import { useRouter } from "next/router";
import HeuristicsLayout from "../shared/HeuristicsLayout";
import { useDispatch, useSelector } from "react-redux";
import { selectProject } from "@/src/reduxStore/states/project";
import { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_HEURISTICS_BY_ID, GET_LABELING_FUNCTION_ON_10_RECORDS, GET_TASK_BY_TASK_ID } from "@/src/services/gql/queries/heuristics";
import { selectHeuristic, setActiveHeuristics, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { postProcessCurrentHeuristic, postProcessLastTaskLogs } from "@/src/util/components/projects/projectId/heuristics/heuristicId/heuristics-details-helper";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { selectAttributes, selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { UPDATE_INFORMATION_SOURCE } from "@/src/services/gql/mutations/heuristics";
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
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { CurrentPage } from "@/src/types/shared/general";
import { timer } from "rxjs";

export default function LabelingFunction() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const attributes = useSelector(selectAttributes);

    const [lastTaskLogs, setLastTaskLogs] = useState<string[]>([]);
    const [selectedAttribute, setSelectedAttribute] = useState<string>(null);
    const [sampleRecords, setSampleRecords] = useState<SampleRecord>(null);
    const [displayLogWarning, setDisplayLogWarning] = useState<boolean>(false);
    const [updatedThroughWebsocket, setUpdatedThroughWebsocket] = useState<boolean>(false);

    const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID);
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE);
    const [refetchTaskByTaskId] = useLazyQuery(GET_TASK_BY_TASK_ID, { fetchPolicy: "no-cache" });
    const [refetchRunOn10] = useLazyQuery(GET_LABELING_FUNCTION_ON_10_RECORDS, { fetchPolicy: "no-cache" })

    useEffect(() => {
        if (!project) return;
        if (!router.query.heuristicId) return;
        refetchLabelingTasksAndProcess();
    }, [project, router.query.heuristicId]);

    useEffect(() => {
        if (!project) return;
        if (!labelingTasks) return;
        refetchCurrentHeuristicAndProcess();
    }, [labelingTasks]);

    useEffect(() => {
        if (!currentHeuristic) return;
        refetchTaskByTaskIdAndProcess();
        WebSocketsService.subscribeToNotification(CurrentPage.LABELING_FUNCTION, {
            projectId: project.id,
            whitelist: ['labeling_task_updated', 'labeling_task_created', 'label_created', 'label_deleted', 'labeling_task_deleted', 'information_source_deleted', 'information_source_updated', 'model_callback_update_statistics', 'payload_progress', 'payload_finished', 'payload_failed', 'payload_created'],
            func: handleWebsocketNotification
        });
    }, [currentHeuristic]);

    function refetchCurrentHeuristicAndProcess() {
        refetchCurrentHeuristic({ variables: { projectId: project.id, informationSourceId: router.query.heuristicId } }).then((res) => {
            dispatch(setActiveHeuristics(postProcessCurrentHeuristic(res['data']['informationSourceBySourceId'], labelingTasks)));
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function saveHeuristic(labelingTaskName: string) {
        if (updatedThroughWebsocket) return;
        const labelingTask = labelingTasks.find(a => a.name == labelingTaskName);
        updateHeuristicMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labelingTaskId: labelingTask.id } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { labelingTaskId: labelingTask.id, labelingTaskName: labelingTask.name, labels: labelingTask.labels }))
        });
    }

    function updateSourceCodeToDisplay(value: string) {
        const finalSourceCode = value.replace('def lf(record)', 'def ' + currentHeuristic.name + '(record)');
        dispatch(updateHeuristicsState(currentHeuristic.id, { sourceCodeToDisplay: finalSourceCode }))
    }

    function refetchTaskByTaskIdAndProcess() {
        if (currentHeuristic.lastTask == null) return;
        if (currentHeuristic.lastTask.state == Status.QUEUED) {
            setLastTaskLogs(["Task is queued for execution"]);
            return;
        }
        refetchTaskByTaskId({ variables: { projectId: project.id, payloadId: currentHeuristic.lastPayload.id } }).then((res) => {
            setLastTaskLogs(postProcessLastTaskLogs((res['data']['payloadByPayloadId'])));
        });
    }

    function getLabelingFunctionOn10Records() {
        setDisplayLogWarning(true);
        refetchRunOn10({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id } }).then((res) => {
            setSampleRecords(postProcessSampleRecords(res['data']['getLabelingFunctionOn10Records'], labelingTasks, currentHeuristic.labelingTaskId));
        });
    }

    function updateSourceCode(value: string) {
        var regMatch: any = getPythonFunctionRegExMatch(value);
        if (!regMatch) return value;
        const finalSourceCode = value.replace(regMatch[0], 'def lf(record)');
        updateHeuristicMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labelingTaskId: currentHeuristic.labelingTaskId, code: finalSourceCode } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { sourceCode: finalSourceCode }))
        });
    }

    function handleWebsocketNotification(msgParts: string[]) {
        if (['labeling_task_updated', 'labeling_task_created', 'label_created', 'label_deleted'].includes(msgParts[1])) {
            refetchLabelingTasksAndProcess();
        } else if ('labeling_task_deleted' == msgParts[1]) {
            alert('Parent labeling task was deleted!');
            router.push(`/projects/${project.id}/heuristics`);
        } else if ('information_source_deleted' == msgParts[1]) {
            alert('Information source was deleted!');
            router.push(`/projects/${project.id}/heuristics`);
        } else if (['information_source_updated', 'model_callback_update_statistics'].includes(msgParts[1])) {
            if (currentHeuristic.id == msgParts[2]) {
                setUpdatedThroughWebsocket(true);
                refetchCurrentHeuristicAndProcess();
            }
        } else if (msgParts[1] == 'payload_progress') {
            if (msgParts[2] != currentHeuristic.id) return;
            dispatch(updateHeuristicsState(currentHeuristic.id, { lastTask: { progress: Number(msgParts[4]), state: Status.CREATED } }))
        } else {
            if (msgParts[2] != currentHeuristic.id) return;
            if (msgParts[1] == 'payload_finished' || msgParts[1] == 'payload_failed' || msgParts[1] == 'payload_created') {
                refetchCurrentHeuristicAndProcess();
                refetchTaskByTaskIdAndProcess();
            }
        }
    }

    return (
        <HeuristicsLayout updateSourceCode={(code: string) => updateSourceCodeToDisplay(code)}>
            {currentHeuristic && <div>
                <div className="relative flex-shrink-0 min-h-16 flex justify-between pb-2">
                    <div className="flex items-center flex-wrap mt-3">
                        <div className="text-sm leading-5 font-medium text-gray-700 inline-block mr-2">Editor</div>
                        <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.LABELING_TASK} color="invert" placement="top">
                            <Dropdown options={labelingTasks.map(a => a.name)} buttonName={currentHeuristic?.labelingTaskName} selectedOption={(option: string) => saveHeuristic(option)} />
                        </Tooltip>
                        {currentHeuristic.labels?.length == 0 ? (<div className="text-sm font-normal text-gray-500 ml-3">No labels for target task</div>) : <>
                            {currentHeuristic.labels?.map((label: any, index: number) => (
                                <Tooltip content={TOOLTIPS_DICT.HEURISTICS.CLICK_TO_COPY} color="invert" placement="top" key={label.name}>
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
                            {/* TODO: Bricks integrator */}
                            <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.INSTALLED_LIBRARIES} color="invert" placement="left">
                                <a href="https://github.com/code-kern-ai/refinery-lf-exec-env/blob/dev/requirements.txt"
                                    target="_blank"
                                    className="bg-white text-gray-700 text-xs font-semibold  px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none">
                                    See installed libraries
                                </a>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <HeuristicsEditor updatedSourceCode={(code: string) => updateSourceCode(code)} />

                <div className="mt-2 flex flex-grow justify-between items-center float-right">
                    <div className="flex items-center">
                        <div className="flex items-center mr-2">
                            <Dropdown options={attributes} buttonName={selectedAttribute ?? 'Select display attribute'} buttonClasses="text-xs font-semibold actionsHeight"
                                selectedOption={(option: string) => setSelectedAttribute(option)} />
                        </div>
                        <Tooltip content={selectedAttribute == null ? TOOLTIPS_DICT.LABELING_FUNCTION.SELECT_ATTRIBUTE : TOOLTIPS_DICT.LABELING_FUNCTION.RUN_ON_10} color="invert" placement="left">
                            <button disabled={selectedAttribute == null} onClick={getLabelingFunctionOn10Records}
                                className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                                Run on 10
                            </button>
                        </Tooltip>
                        <HeuristicRunButtons updateDisplayLogWarning={val => setDisplayLogWarning(val)} />
                    </div>
                </div>
                {sampleRecords && sampleRecords.records.length > 0 && !sampleRecords.codeHasErrors && <>
                    <SampleRecords sampleRecords={sampleRecords} selectedAttribute={selectedAttribute} />
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