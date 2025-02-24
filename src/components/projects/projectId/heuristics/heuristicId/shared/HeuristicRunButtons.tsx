import LoadingIcon from "@/submodules/react-components/components/LoadingIcon";
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
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";

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
            <KernButton
                onClick={runHeuristic}
                disabled={!canStartHeuristic || props.runOn10IsRunning}
                text="Run"
                buttonColor="blue"
                className="ml-2"
                tooltip={props.runOn10IsRunning ? TOOLTIPS_DICT.HEURISTICS.RUN_ON_10_RUNNING : TOOLTIPS_DICT.HEURISTICS.RUN}
                tooltipPlacement="left"
            />

            <KernButton
                text="Run + weakly supervise"
                buttonColor="indigo"
                solidTheme={true}
                textColor="white"
                onClick={runHeuristicAndWeaklySupervise}
                disabled={!canStartHeuristic || props.runOn10IsRunning}
                tooltip={props.runOn10IsRunning ? TOOLTIPS_DICT.HEURISTICS.RUN_ON_10_RUNNING : TOOLTIPS_DICT.HEURISTICS.RUN_WS}
                tooltipPlacement="left"
                className="ml-2"
            />
        </>
    )
}