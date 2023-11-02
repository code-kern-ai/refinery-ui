import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { selectProject } from "@/src/reduxStore/states/project";
import { CREATE_INFORMATION_SOURCE_PAYLOAD, RUN_HEURISTIC_THEN_TRIGGER_WEAK_SUPERVISION } from "@/src/services/gql/mutations/heuristics";
import { HeuristicRunButtonsProps } from "@/src/types/components/projects/projectId/heuristics/heuristicId/heuristics-details";
import { Status } from "@/src/types/shared/statuses";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";
import { InformationSourceType } from "@/submodules/javascript-functions/enums/enums";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function HeuristicRunButtons(props: HeuristicRunButtonsProps) {
    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);

    const [canStartHeuristic, setCanStartHeuristic] = useState(true);
    const [justClickedRun, setJustClickedRun] = useState(false);

    const [createTaskMut] = useMutation(CREATE_INFORMATION_SOURCE_PAYLOAD);
    const [runHeuristicAndWeaklySuperviseMut] = useMutation(RUN_HEURISTIC_THEN_TRIGGER_WEAK_SUPERVISION);

    useEffect(() => {
        setCanStartHeuristic(checkCanStartHeuristic());
    }, [currentHeuristic]);

    function runHeuristic() {
        setJustClickedRun(true);
        createTaskMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id } }).then((res) => {
            setJustClickedRun(false);
            if (currentHeuristic.informationSourceType === InformationSourceType.LABELING_FUNCTION) {
                props.updateDisplayLogWarning(false);
            }
        });
    }

    function runHeuristicAndWeaklySupervise() {
        runHeuristicAndWeaklySuperviseMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labelingTaskId: currentHeuristic.labelingTaskId } }).then((res) => {
            setJustClickedRun(false);
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
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.RUN} color="invert" placement="left">
                <button onClick={runHeuristic} disabled={!canStartHeuristic}
                    className="ml-2 text-xs font-medium px-4 py-2 rounded-md border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    Run
                </button>
            </Tooltip>
            <Tooltip content={TOOLTIPS_DICT.HEURISTICS.RUN_WS} color="invert" placement="left">
                <button onClick={runHeuristicAndWeaklySupervise} disabled={!canStartHeuristic}
                    className="ml-2 text-white text-xs font-medium px-4 py-2 rounded-md border bg-indigo-700 hover:bg-indigo-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    Run + weakly supervise
                </button>
            </Tooltip>
        </>
    )
}