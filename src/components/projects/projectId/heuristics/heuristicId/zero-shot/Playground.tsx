import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import { openModal } from "@/src/reduxStore/states/modal";
import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { GET_ZERO_SHOT_TEXT } from "@/src/services/gql/queries/heuristics";
import { ModalEnum } from "@/src/types/shared/modal";
import { postProcessZeroShotText } from "@/src/util/components/projects/projectId/heuristics/heuristicId/zero-shot-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { useLazyQuery } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Fragment, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import ZeroShotExecution from "./ZeroShotExecution";

export default function Playground() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const currentHeuristic = useSelector(selectHeuristic);
    const labelingTasks = useSelector(selectLabelingTasksAll);

    const [testInput, setTestInput] = useState<string>("");
    const [customLabels, setCustomLabels] = useState<string>("");
    const [testerRequestedSomething, setTesterRequestedSomething] = useState<boolean>(false);
    const [singleLineTesterResult, setSingleLineTesterResult] = useState<string[]>([]);

    const [refetchZeroShotText] = useLazyQuery(GET_ZERO_SHOT_TEXT, { fetchPolicy: 'network-only' });

    function runZeroShotTest() {
        if (testInput.length == 0) return;
        if (testerRequestedSomething) return;
        let labels;
        const useTaskLabels = customLabels == "";
        if (useTaskLabels) {
            labels = labelingTasks.find(task => task.id == currentHeuristic.labelingTaskId).labels
                .filter(l => currentHeuristic.zeroShotSettings.excludedLabels.includes(l.id))
                .map(l => l.name);
        }
        else labels = customLabels.split(",").map(l => l.trim());
        if (!labels.length) return;
        setTesterRequestedSomething(true);
        setSingleLineTesterResult([]);
        refetchZeroShotText({
            variables: {
                projectId: projectId, informationSourceId: currentHeuristic.id, config: currentHeuristic.zeroShotSettings.targetConfig, text: testInput, runIndividually: currentHeuristic.zeroShotSettings.runIndividually, labels: JSON.stringify(labels)
            }
        }).then(res => {
            const labels = labelingTasks.find(task => task.id == currentHeuristic.labelingTaskId).labels
            setSingleLineTesterResult(postProcessZeroShotText(res.data['zeroShotText'], labels).labels);
            setTesterRequestedSomething(false);
        });
    }

    return (
        <>
            <div className="mt-8 text-sm leading-5">
                <div className="text-gray-700 font-medium">
                    Playground
                    <span className="text-gray-500 font-normal ml-2">
                        Zero-shot models take some time, so feel free to play around with it a bit before, during or after you run the heuristic.
                    </span>
                </div>

                <div>
                    <input value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="Enter any text..." onKeyDown={(e) => { if (e.key == 'Enter') runZeroShotTest() }} type="text"
                        className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                </div>

                <div className="flex flex-row items-center mt-2">
                    <span className="text-sm leading-10 text-gray-500 font-normal mr-3 flex-shrink-0">
                        By default we use the labels from your selected task. You can also switch them on or off.
                    </span>
                    <input value={customLabels} onChange={e => setCustomLabels(e.target.value)} placeholder="You can test with different labels. Separate them by comma" type="text"
                        className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />

                    <div className="w-8">
                        {testerRequestedSomething && <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.WHY_SO_LONG} color="invert" placement="top">
                            <div className="cursor-pointer" onClick={() => dispatch(openModal(ModalEnum.WHY_SO_LONG))}>
                                <LoadingIcon color="indigo" />
                            </div>
                        </Tooltip>}
                    </div>
                    <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.COMPUTE_TEXT} color="invert" placement="left">
                        <button disabled={testerRequestedSomething} onClick={runZeroShotTest}
                            className="ml-3 bg-indigo-700 whitespace-nowrap text-white text-xs leading-4 font-medium px-4 py-2 rounded-md border cursor-pointer hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            Compute example
                        </button>
                    </Tooltip>
                </div>

                {singleLineTesterResult.length > 0 && <div className="mt-2 text-sm leading-5">
                    <span className="text-gray-700 font-semibold">Prediction</span>
                    <div className="flex gap-x-2 items-center" style={{ gridTemplateColumns: 'max content 16.5rem max-content' }}>
                        {singleLineTesterResult.map((result: any, index) => (<Fragment key={index}>
                            {result.color ? (<div className={`border items-center px-2 py-0.5 rounded text-xs font-medium text-center m-2 ${result.color.backgroundColor} ${result.color.textColor} ${result.color.borderColor} ${result.color.hoverColor}`}>
                                {result.labelName}
                            </div>) : (<div
                                className="border items-center px-2 py-0.5 rounded text-xs font-medium text-center m-2 bg-gray-100 text-gray-700 border-gray-400 hover:bg-gray-200">
                                {result.labelName}
                            </div>)}
                            <div className="text-sm leading-5 font-normal text-gray-500">
                                <div className="w-64 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': result.confidenceText }}>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row items-center">
                                <span className="text-sm select-none self-start mr-2">{result.confidenceText}</span>
                                {(result.confidence * 100) < currentHeuristic.zeroShotSettings.minConfidence && <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.CONFIDENCE_TOO_LOW} color="invert" placement="top">
                                    <IconAlertTriangle className="text-yellow-500 h-5 w-5" />
                                </Tooltip>}
                            </div>
                        </Fragment>))}
                    </div>

                </div>}

                <Modal modalName={ModalEnum.WHY_SO_LONG}>
                    <h1 className="text-lg text-gray-900 mb-2">Why is this taking so long?</h1>
                    <div className="text-sm text-gray-500 my-2">
                        Zero shot modules take a lot of time. That&apos;s unfortunate but nothing problematic. However, if the test center takes longer than expected usually the reason is that
                        the underlying models needs to be prepared. But fear not! This is a task that only needs to be done once.
                    </div>
                </Modal>
            </div>

            <ZeroShotExecution customLabels={customLabels} />
        </>
    )
}