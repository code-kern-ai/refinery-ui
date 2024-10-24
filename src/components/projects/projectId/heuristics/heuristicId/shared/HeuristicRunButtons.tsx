import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createTask } from "@/src/services/base/heuristic";
import { runThenWeakSupervision } from "@/src/services/base/weak-supervision";
import { HeuristicRunButtonsProps } from "@/src/types/components/projects/projectId/heuristics/heuristicId/heuristics-details";
import { Status } from "@/src/types/shared/statuses";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function HeuristicRunButtons(props: HeuristicRunButtonsProps) {
    const projectId = useSelector(selectProjectId);
    const currentHeuristic = useSelector(selectHeuristic);

    const [canStartHeuristic, setCanStartHeuristic] = useState(true);
    const [justClickedRun, setJustClickedRun] = useState(false);

    useEffect(() => {
        setCanStartHeuristic(checkCanStartHeuristic());
        if (!props.checkCanStartHeuristic) return;
        props.checkCanStartHeuristic(checkCanStartHeuristic());
    }, [currentHeuristic, props.checkCanStartHeuristic]);

    function runHeuristic() {
        setJustClickedRun(true);
        if (props.justClickedRun) props.justClickedRun(true);
        createTask(projectId, currentHeuristic.id, (res) => {
            setJustClickedRun(false);
            if (props.justClickedRun) props.justClickedRun(false);
            if (currentHeuristic.informationSourceType === InformationSourceType.LABELING_FUNCTION) {
                props.updateDisplayLogWarning(false);

            }
        });
    }

    function runHeuristicAndWeaklySupervise() {
        setJustClickedRun(true);
        if (props.justClickedRun) props.justClickedRun(true);
        runThenWeakSupervision(projectId, currentHeuristic.id, currentHeuristic.labelingTaskId, (res) => {
            setJustClickedRun(false);
            if (props.justClickedRun) props.justClickedRun(false);
            if (currentHeuristic.informationSourceType === InformationSourceType.LABELING_FUNCTION) {
                props.updateDisplayLogWarning(false);
            }
        });
    }

    function checkCanStartHeuristic() {
        if (justClickedRun) return false;
        if (!currentHeuristic) return false;
        if (!currentHeuristic.lastTask) return true;
        if (currentHeuristic.lastTask.state === Status.FINISHED || currentHeuristic.lastTask.state === Status.FAILED) return true;
        const d: Date = dateAsUTCDate(new Date(currentHeuristic.lastTask.createdAt));
        const current: Date = new Date();
        if (d.getTime() - current.getTime() > 600000) return true; // older than 10 min
        return false;
    }

    return (
        <>
            {justClickedRun && <div><LoadingIcon color="indigo" /></div>}
            <Tooltip content={props.runOn10IsRunning ? TOOLTIPS_DICT.HEURISTICS.RUN_ON_10_RUNNING : TOOLTIPS_DICT.HEURISTICS.RUN} color="invert" placement="left">
                <button onClick={runHeuristic} disabled={!canStartHeuristic || props.runOn10IsRunning}
                    className="ml-2 text-xs font-medium px-4 py-2 rounded-md border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    Run
                </button>
            </Tooltip>
            <Tooltip content={props.runOn10IsRunning ? TOOLTIPS_DICT.HEURISTICS.RUN_ON_10_RUNNING : TOOLTIPS_DICT.HEURISTICS.RUN_WS} color="invert" placement="left">
                <button onClick={runHeuristicAndWeaklySupervise} disabled={!canStartHeuristic || props.runOn10IsRunning}
                    className="ml-2 text-white text-xs font-medium px-4 py-2 rounded-md border bg-indigo-700 hover:bg-indigo-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    Run + weakly supervise
                </button>
            </Tooltip>
        </>
    )
}