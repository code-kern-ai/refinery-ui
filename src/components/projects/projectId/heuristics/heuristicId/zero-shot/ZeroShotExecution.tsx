import Modal from "@/src/components/shared/modal/Modal";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { RUN_ZERO_SHOT_PROJECT } from "@/src/services/gql/mutations/heuristics";
import { GET_ZERO_SHOT_10_RANDOM_RECORDS } from "@/src/services/gql/queries/heuristics";
import { ZeroShotExecutionProps } from "@/src/types/components/projects/projectId/heuristics/heuristicId/zero-shot";
import { ModalEnum } from "@/src/types/shared/modal";
import { Status } from "@/src/types/shared/statuses";
import { postProcessZeroShot10Records } from "@/src/util/components/projects/projectId/heuristics/heuristicId/zero-shot-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants"
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react"
import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ZeroShotExecution(props: ZeroShotExecutionProps) {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);

    const [canRunProject, setCanRunProject] = useState(false);
    const [randomRecordTesterResult, setRandomRecordTesterResult] = useState(null);
    const [testerRequestedSomething, setTesterRequestedSomething] = useState(false);

    const [refetchZeroShot10Records] = useLazyQuery(GET_ZERO_SHOT_10_RANDOM_RECORDS, { fetchPolicy: 'network-only' });
    const [runZeroShotMut] = useMutation(RUN_ZERO_SHOT_PROJECT);

    useEffect(() => {
        if (currentHeuristic) {
            setCanRunProject(!currentHeuristic.lastTask || currentHeuristic.lastTask.state != Status.CREATED);
        }
    }, [currentHeuristic]);

    function runZeroShot10RecordTest() {
        if (testerRequestedSomething) return;
        let labels;
        const useTaskLabels = props.customLabels == '';
        if (!useTaskLabels) labels = JSON.stringify(props.customLabels.split(",").map(l => l.trim()));
        else labels = labelingTasks.find(task => task.id == currentHeuristic.labelingTaskId).labels
            .filter(l => currentHeuristic.zeroShotSettings.excludedLabels.includes(l.id))
            .map(l => l.name);
        if (!labels.length) return;
        setTesterRequestedSomething(true);
        setRandomRecordTesterResult(null);
        refetchZeroShot10Records({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, labels: JSON.stringify(labels) } }).then((res) => {
            const labels = labelingTasks.find(task => task.id == currentHeuristic.labelingTaskId).labels
            setRandomRecordTesterResult(postProcessZeroShot10Records(res.data['zeroShot10Records'], labels));
            setTesterRequestedSomething(false);
        });
    }

    function runZeroShotProject() {
        if (!canRunProject) return;
        setTesterRequestedSomething(true);
        runZeroShotMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id } }).then((res) => {
            setTesterRequestedSomething(false);
        });
    }

    return (<>
        <div className="mt-8 text-sm leading-5">
            <div className="text-gray-700 font-medium mr-2">
                Execution
            </div>
            <div className="grid items-center" style={{ gridTemplateColumns: 'auto max-content 0px' }} >
                <div className="text-gray-500 font-normal">You can execute your model on all records, or test-run it on 10 examples (which are sampled randomly). Test results are shown below after computation.</div>
                <div className="flex">
                    <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.EXECUTE_10_RECORDS} color="invert" placement="left">
                        <button onClick={runZeroShot10RecordTest}
                            className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Run on 10
                        </button>
                    </Tooltip>

                    <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.EXECUTE_ALL_RECORDS} color="invert" placement="left">
                        <button onClick={runZeroShotProject} disabled={!canRunProject}
                            className="bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer ml-3 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            Run
                        </button>
                    </Tooltip>

                </div>
            </div>
        </div>
        {randomRecordTesterResult && <div className="mt-4 flex flex-col">
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <div className="min-w-full border divide-y divide-gray-300">
                            {randomRecordTesterResult.records.map((record, i) => (<div key={i} className="divide-y divide-gray-200 bg-white">
                                {record.labels.length > 0 && <div className="flex-shrink-0 border-b border-gray-200 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center text-xs leading-5 text-gray-500 font-normal ml-4 my-3 text-left">
                                        {record.checkedText}
                                    </div>
                                    <div className="flex flex-row flex-nowrap items-center" style={{ gridTemplateColumns: 'auto 40px 40px 80px' }}>
                                        {record.labels[0].color ? (<div className="flex items-center justify-center mr-5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${record.labels[0].color.backgroundColor} ${record.labels[0].color.textColor} ${record.labels[0].color.borderColor} ${record.labels[0].color.hoverColor}`}>
                                                {record.labels[0].labelName}
                                            </span></div>) : (<div className="border items-center px-2 py-0.5 rounded text-xs font-medium text-center m-2 bg-gray-100 text-gray-700 border-gray-400 hover:bg-gray-200">
                                                {record.labels[0].labelName}
                                            </div>)}
                                        <div className="flex items-center justify-center">
                                            <span className="text-xs leading-5 text-gray-500 font-normal text-center">
                                                {record.labels[0].confidenceText}
                                            </span>
                                        </div>
                                        <div className="flex flex-row items-center">
                                            {(record.labels[0].confidence * 100) < currentHeuristic.zeroShotSettings.minConfidence ? <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.CONFIDENCE_TOO_LOW} color="invert" placement="top">
                                                <IconAlertTriangle className="text-yellow-500 h-5 w-5 ml-1 mr-3" />
                                            </Tooltip> : <div className="w-10"></div>}
                                        </div>
                                        <div className="flex items-center justify-center mr-5">
                                            <label onClick={() => dispatch(setModalStates(ModalEnum.SAMPLE_RECORDS_ZERO_SHOT, { currentRecordIdx: i, open: true }))}
                                                className=" bg-white text-gray-700 text-xs font-semibold px-4 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none inline-block">
                                                View
                                            </label>
                                        </div>
                                    </div>
                                </div>}
                            </div>))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal modalName={ModalEnum.SAMPLE_RECORDS_ZERO_SHOT}>

            </Modal>
        </div>}
    </>
    )
}