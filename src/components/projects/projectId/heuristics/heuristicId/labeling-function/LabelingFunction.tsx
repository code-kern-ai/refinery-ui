import { useRouter } from "next/router";
import HeuristicsLayout from "../shared/HeuristicsLayout";
import { useDispatch, useSelector } from "react-redux";
import { selectProject } from "@/src/reduxStore/states/project";
import { use, useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_HEURISTICS_BY_ID } from "@/src/services/gql/queries/heuristics";
import { selectHeuristic, setActiveHeuristics, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { postProcessCurrentHeuristic } from "@/src/util/components/projects/projectId/heuristics/heuristicId/heuristics-details-helper";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-contants";
import { GET_LABELING_TASKS_BY_PROJECT_ID } from "@/src/services/gql/queries/project-setting";
import { postProcessLabelingTasks, postProcessLabelingTasksSchema } from "@/src/util/components/projects/projectId/settings/labeling-tasks-helper";
import { selectLabelingTasksAll, setLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { UPDATE_INFORMATION_SOURCE } from "@/src/services/gql/mutations/heuristics";
import HeuristicsEditor from "../shared/HeuristicsEditor";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";

export default function LabelingFunction() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);

    const [refetchCurrentHeuristic] = useLazyQuery(GET_HEURISTICS_BY_ID);
    const [refetchLabelingTasksByProjectId] = useLazyQuery(GET_LABELING_TASKS_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [updateHeuristicMut] = useMutation(UPDATE_INFORMATION_SOURCE);

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
        const labelingTask = labelingTasks.find(a => a.name == labelingTaskName);
        updateHeuristicMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labelingTaskId: labelingTask.id } }).then((res) => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { labelingTaskId: labelingTask.id, labelingTaskName: labelingTask.name, labels: labelingTask.labels }))
        });
    }

    function updateSourceCodeToDisplay(value: string) {
        const finalSourceCode = value.replace('def lf(record)', 'def ' + currentHeuristic.name + '(record)');
        dispatch(updateHeuristicsState(currentHeuristic.id, { sourceCodeToDisplay: finalSourceCode }))
    }

    return (
        <HeuristicsLayout updateSourceCode={(code: string) => updateSourceCodeToDisplay(code)}>
            {currentHeuristic && <div className="relative flex-shrink-0 min-h-16 flex justify-between pb-2">
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
            </div>}

            <HeuristicsEditor />

        </HeuristicsLayout>
    )
}