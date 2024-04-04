import { setModalStates } from "@/src/reduxStore/states/modal";
import { selectHeuristic, setActiveHeuristics } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll, selectTextAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ZeroShotExecutionProps } from "@/src/types/components/projects/projectId/heuristics/heuristicId/zero-shot";
import { ModalEnum } from "@/src/types/shared/modal";
import { Status } from "@/src/types/shared/statuses";
import { postProcessZeroShot, postProcessZeroShot10Records } from "@/src/util/components/projects/projectId/heuristics/heuristicId/zero-shot-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants"
import { Tooltip } from "@nextui-org/react"
import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ViewDetailsZSModal from "./ViewDetailsZSModal";
import { useRouter } from "next/router";
import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { getHeuristicByHeuristicId } from "@/src/services/base/heuristic";
import { getZeroShot10Records, initZeroShot } from "@/src/services/base/zero-shot";

export default function ZeroShotExecution(props: ZeroShotExecutionProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const textAttributes = useSelector(selectTextAttributes);

    const [canRunProject, setCanRunProject] = useState(false);
    const [randomRecordTesterResult, setRandomRecordTesterResult] = useState(null);
    const [testerRequestedSomething, setTesterRequestedSomething] = useState(false);
    const [modelFailedMessage, setModelFailedMessage] = useState(null);
    const [noLabelsMessage, setNoLabelsMessage] = useState(null);

    useEffect(() => {
        if (currentHeuristic) {
            setCanRunProject(!currentHeuristic.lastTask || currentHeuristic.lastTask.state != Status.CREATED);
        }
    }, [currentHeuristic]);

    function runZeroShot10RecordTest() {
        setModelFailedMessage(false);
        setNoLabelsMessage(false);
        if (testerRequestedSomething) return;
        let labels;
        const useTaskLabels = props.customLabels == '';
        if (!useTaskLabels) labels = props.customLabels.split(",").map(l => l.trim());
        else labels = labelingTasks.find(task => task.id == currentHeuristic.labelingTaskId).labels
            .filter(l => !currentHeuristic.zeroShotSettings.excludedLabels.includes(l.id))
            .map(l => l.name);
        if (!labels.length) {
            setNoLabelsMessage(true);
            return;
        }
        setTesterRequestedSomething(true);
        setRandomRecordTesterResult(null);
        getZeroShot10Records(projectId, currentHeuristic.id, labels, (res) => {
            if (res.errors && res.errors.length > 0) {
                setModelFailedMessage(true);
                setTesterRequestedSomething(false);
                props.setIsModelDownloading(false);
                return;
            }
            const labels = labelingTasks.find(task => task.id == currentHeuristic.labelingTaskId).labels
            setRandomRecordTesterResult(postProcessZeroShot10Records(res.data['zeroShot10Records'], labels));
            setTesterRequestedSomething(false);
            setModelFailedMessage(false);
        });
    }

    function runZeroShotProject() {
        if (!canRunProject) return;
        if (testerRequestedSomething) return;
        setTesterRequestedSomething(true);
        initZeroShot(projectId, currentHeuristic.id, (res) => {
            setTesterRequestedSomething(false);
            getHeuristicByHeuristicId(projectId, router.query.heuristicId as string, (res) => {
                dispatch(setActiveHeuristics(postProcessZeroShot(res['data']['informationSourceBySourceId'], labelingTasks, textAttributes)));
            });
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
                    {testerRequestedSomething && <div className="m-1"> <LoadingIcon color="indigo" /></div>}
                    <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.EXECUTE_10_RECORDS} color="invert" placement="top">
                        <button onClick={runZeroShot10RecordTest}
                            className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Run on 10
                        </button>
                    </Tooltip>

                    <Tooltip content={testerRequestedSomething ? TOOLTIPS_DICT.ZERO_SHOT.RUN_ON_10_TEST : TOOLTIPS_DICT.ZERO_SHOT.EXECUTE_ALL_RECORDS} color="invert" placement="top">
                        <button onClick={runZeroShotProject} disabled={!canRunProject || testerRequestedSomething || currentHeuristic.state == Status.QUEUED}
                            className="bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer ml-3 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            Run
                        </button>
                    </Tooltip>
                </div>
            </div>
            {modelFailedMessage && <div className="mt-2 text-sm leading-5 text-red-700">Error when running test, ensure that you have valid model and labels.</div>}
            {noLabelsMessage && <div className="mt-2 text-sm leading-5 text-red-700">No labels to run zero-shot.</div>}
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
                                    <div className="grid flex-nowrap items-center" style={{ gridTemplateColumns: 'auto 50px 40px 80px' }}>
                                        {record.labels[0].color ? (<div className="flex items-center justify-center mr-5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${record.labels[0].color.backgroundColor} ${record.labels[0].color.textColor} ${record.labels[0].color.borderColor} ${record.labels[0].color.hoverColor}`}>
                                                {record.labels[0].labelName}
                                            </span></div>) : (<div className="flex items-center justify-center mr-5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-gray-100 text-gray-700 border-gray-400 hover:bg-gray-200`}>
                                                    {record.labels[0].labelName}
                                                </span></div>)}
                                        <div className="flex items-center justify-center">
                                            <span className="text-xs leading-5 text-gray-500 font-normal text-center">
                                                {record.labels[0].confidenceText}
                                            </span>
                                        </div>
                                        <div className="flex flex-row items-center">
                                            {record.labels[0].confidence < currentHeuristic.zeroShotSettings.minConfidence ? <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.CONFIDENCE_TOO_LOW} color="invert" placement="top" className="cursor-auto">
                                                <IconAlertTriangle className="text-yellow-500 h-5 w-5 ml-1 mr-3" />
                                            </Tooltip> : <div className="w-10"></div>}
                                        </div>
                                        <div className="flex items-center justify-center mr-5">
                                            <label onClick={() => dispatch(setModalStates(ModalEnum.SAMPLE_RECORDS_ZERO_SHOT, { record: record, open: true }))}
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
            <ViewDetailsZSModal />
        </div >}
    </>
    )
}