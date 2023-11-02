import { useDispatch, useSelector } from "react-redux";
import HeuristicsLayout from "../shared/HeuristicsLayout";
import { useRouter } from "next/router";
import { selectProject } from "@/src/reduxStore/states/project";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_HEURISTICS_BY_ID, GET_TASK_BY_TASK_ID } from "@/src/services/gql/queries/heuristics";
import { Fragment, useEffect, useState } from "react";
import { selectHeuristic, setActiveHeuristics, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { getClassLine, postProcessCurrentHeuristic, postProcessLastTaskLogs } from "@/src/util/components/projects/projectId/heuristics/heuristicId/heuristics-details-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { selectAttributes, selectEmbeddings, selectEmbeddingsFiltered, selectLabelingTasksAll, setAllEmbeddings, setFilteredEmbeddings, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { UPDATE_INFORMATION_SOURCE } from "@/src/services/gql/mutations/heuristics";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { postProcessingEmbeddings } from "@/src/util/components/projects/projectId/settings/embeddings-helper";
import { embeddingRelevant } from "@/src/util/components/projects/projectId/heuristics/heuristicId/labeling-functions-helper";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { Status } from "@/src/types/shared/statuses";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import HeuristicsEditor from "../shared/HeuristicsEditor";
import HeuristicRunButtons from "../shared/HeuristicRunButtons";
import ContainerLogs from "@/src/components/shared/logs/ContainerLogs";
import HeuristicStatistics from "../shared/HeuristicStatistics";
import DangerZone from "@/src/components/shared/danger-zone/DangerZone";
import { DangerZoneEnum } from "@/src/types/shared/danger-zone";
import { getPythonClassRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";

export default function ActiveLearning() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const embeddings = useSelector(selectEmbeddings);
    const embeddingsFiltered = useSelector(selectEmbeddingsFiltered);
    const attributes = useSelector(selectAttributes);

    const [lastTaskLogs, setLastTaskLogs] = useState<string[]>([]);

    const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID);
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE);
    const [refetchEmbeddings] = useLazyQuery(GET_EMBEDDING_SCHEMA_BY_PROJECT_ID, { fetchPolicy: "no-cache" });
    const [refetchTaskByTaskId] = useLazyQuery(GET_TASK_BY_TASK_ID, { fetchPolicy: "no-cache" });

    useEffect(() => {
        if (!project) return;
        if (!router.query.heuristicId) return;
        refetchLabelingTasksAndProcess();
        refetchEmbeddingsAndPostProcess();
    }, [project, router.query.heuristicId]);

    useEffect(() => {
        if (!project) return;
        if (!labelingTasks) return;
        refetchCurrentHeuristicAndProcess();
    }, [labelingTasks]);

    useEffect(() => {
        if (!currentHeuristic) return;
        if (!embeddings) return;
        dispatch(setFilteredEmbeddings(embeddings.filter(e => embeddingRelevant(e, attributes, labelingTasks, currentHeuristic.labelingTaskId))));
        refetchTaskByTaskIdAndProcess();
    }, [currentHeuristic]);

    function refetchTaskByTaskIdAndProcess() {
        if (currentHeuristic.lastTask == null) return;
        if (currentHeuristic.lastTask.state == Status.QUEUED) {
            setLastTaskLogs(["Task is queued for execution"]);
            return;
        }
        refetchTaskByTaskId({ variables: { projectId: project.id, payloadId: currentHeuristic.lastTask.id } }).then((res) => {
            setLastTaskLogs(postProcessLastTaskLogs((res['data']['payloadByPayloadId'])));
        });
    }

    function refetchCurrentHeuristicAndProcess() {
        refetchCurrentHeuristic({ variables: { projectId: project.id, informationSourceId: router.query.heuristicId } }).then((res) => {
            dispatch(setActiveHeuristics(postProcessCurrentHeuristic(res['data']['informationSourceBySourceId'], labelingTasks)));
        });
    }

    function saveHeuristic(labelingTaskName: string) {
        const labelingTask = labelingTasks.find(a => a.name == labelingTaskName);
        updateHeuristicMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labelingTaskId: labelingTask.id } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { labelingTaskId: labelingTask.id, labelingTaskName: labelingTask.name, labels: labelingTask.labels }))
        });
    }

    function refetchLabelingTasksAndProcess() {
        refetchLabelingTasksByProjectId({ variables: { projectId: project.id } }).then((res) => {
            const labelingTasks = postProcessLabelingTasks(res['data']['projectByProjectId']['labelingTasks']['edges']);
            dispatch(setLabelingTasksAll(postProcessLabelingTasksSchema(labelingTasks)));
        });
    }

    function refetchEmbeddingsAndPostProcess() {
        refetchEmbeddings({ variables: { projectId: project.id } }).then((res) => {
            const embeddings = postProcessingEmbeddings(res.data['projectByProjectId']['embeddings']['edges'].map((e) => e['node']), []);
            dispatch(setAllEmbeddings(embeddings));
        });
    }

    function updateSourceCodeToDisplay(value: string) {
        const finalSourceCode = value.replace(getClassLine(null, labelingTasks, currentHeuristic.labelingTaskId), getClassLine(currentHeuristic.name, labelingTasks, currentHeuristic.labelingTaskId))
        dispatch(updateHeuristicsState(currentHeuristic.id, { sourceCodeToDisplay: finalSourceCode }))
    }

    function updateSourceCode(value: string) {
        var regMatch: any = getPythonClassRegExMatch(value);
        if (!regMatch) return value;
        const finalSourceCode = value.replace(regMatch[0], getClassLine(null, labelingTasks, currentHeuristic.labelingTaskId));
        updateHeuristicMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labelingTaskId: currentHeuristic.labelingTaskId, code: finalSourceCode } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { sourceCode: finalSourceCode }))
        });
    }

    return (
        <HeuristicsLayout updateSourceCode={(code) => updateSourceCodeToDisplay(code)}>
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
                                    <span className={`inline-flex border items-center px-2 py-0.5 rounded text-xs font-medium cursor-pointer ml-3 ${label.color.backgroundColor} ${label.color.hoverColor} ${label.color.textColor} ${label.color.borderColor}`}>
                                        {label.name}
                                    </span>
                                </Tooltip>
                            ))}
                        </>}
                    </div>
                </div>
                <div className="flex flex-row items-center mb-3">
                    <div className="flex items-center">
                        {embeddings.length > 0 ? (<>
                            {embeddingsFiltered.length > 0 ? (<>
                                {embeddingsFiltered.map((embedding: Embedding, index: number) => <Fragment key={embedding.id}>
                                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block mr-2">Embeddings</div>
                                    {embedding.state == Status.FINISHED && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.CLICK_TO_COPY} color="invert" placement="top">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 cursor-pointer" onClick={() => copyToClipboard(embedding.name)}>
                                            {embedding.name}
                                        </span>
                                    </Tooltip>}
                                    {embedding.state == Status.FAILED && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.CLICK_TO_COPY_ERROR} color="invert" placement="top">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 cursor-pointer" onClick={() => copyToClipboard(embedding.name)}>
                                            {embedding.name}
                                        </span>
                                    </Tooltip>}
                                    {(embedding.state != Status.FINISHED && embedding.state != Status.FAILED) && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.CLICK_TO_COPY_ERROR} color="invert" placement="top">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 cursor-pointer" onClick={() => copyToClipboard(embedding.name)}>
                                            {embedding.name}
                                        </span>
                                    </Tooltip>}
                                </Fragment>)}
                            </>) : (<div className="text-sm font-normal text-gray-500">No matching embeddings found</div>)}
                        </>) : (<div className="text-sm font-normal text-gray-500">No embeddings for project</div>
                        )}
                    </div>
                    <div className="flex flex-row flex-nowrap items-center ml-auto">
                        {/* TODO: Add bricks integrator */}
                    </div>
                </div>
                <HeuristicsEditor updatedSourceCode={(code: string) => updateSourceCode(code)} />

                <div className="mt-2 flex flex-grow justify-between items-center float-right">
                    <div className="flex items-center">
                        <HeuristicRunButtons />
                    </div>
                </div>

                <ContainerLogs logs={lastTaskLogs} type="heuristic" />

                <HeuristicStatistics />

                <DangerZone elementType={DangerZoneEnum.ACTIVE_LEARNING} id={currentHeuristic.id} name={currentHeuristic.name} />
            </div>
            }
        </HeuristicsLayout >
    )
}