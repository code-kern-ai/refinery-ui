import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import { openModal, selectModal } from "@/src/reduxStore/states/modal";
import { selectHeuristic } from "@/src/reduxStore/states/pages/heuristics";
import { selectProject } from "@/src/reduxStore/states/project";
import { CANCEL_ZERO_SHOT_RUN } from "@/src/services/gql/mutations/heuristics";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { Status } from "@/src/types/shared/statuses";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconAlertTriangleFilled, IconArrowRight, IconCircleCheckFilled } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Cancel', useButton: true, disabled: false };

export default function CalculationProgress() {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
    const currentHeuristic = useSelector(selectHeuristic);
    const modalCancel = useSelector(selectModal(ModalEnum.CANCEL_EXECUTION));

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const [cancelExecutionMut] = useMutation(CANCEL_ZERO_SHOT_RUN);

    const cancelExecution = useCallback(() => {
        cancelExecutionMut({ variables: { projectId: project.id, informationSourceId: currentHeuristic.id, payloadId: currentHeuristic.lastTask.id } }).then(() => { });
    }, [modalCancel]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: cancelExecution });
    }, [modalCancel]);


    return (<div className="mt-8">
        <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Last execution</div>
        {currentHeuristic.lastTask ? (<>
            <div className="mb-4 card border border-gray-200 bg-white flex-grow overflow-visible rounded-2xl">
                <div className="card-body p-6">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-grow items-center">
                            {currentHeuristic.lastTask.state === Status.CREATED && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.CURRENTLY_RUNNING} color="invert" placement="right">
                                <LoadingIcon />
                            </Tooltip>}
                            {currentHeuristic.lastTask.state == Status.FINISHED && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.FINISHED} color="invert">
                                <IconCircleCheckFilled className="h-6 w-6 text-green-500" />
                            </Tooltip>}
                            {currentHeuristic.lastTask.state == Status.FAILED && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.ERROR} color="invert">
                                <IconAlertTriangleFilled className="h-6 w-6 text-red-500" />
                            </Tooltip>}
                            {currentHeuristic.lastTask.state === Status.CREATED ? (<>
                                <Tooltip content={TOOLTIPS_DICT.ZERO_SHOT.CANCEL_EXECUTION} color="invert" placement="top">
                                    <div onClick={() => dispatch(openModal(ModalEnum.CANCEL_EXECUTION))}
                                        className="text-sm leading-5 font-normal text-gray-500">run#{currentHeuristic.lastTask.iteration}</div>
                                </Tooltip>
                                <div className="text-sm leading-5 font-normal text-gray-500 w-full">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': currentHeuristic.lastTask.progress + '%' }}>
                                        </div>
                                    </div>
                                </div>
                            </>) : (<><div className="text-sm leading-5 font-normal text-gray-500">run#{currentHeuristic.lastTask.iteration}</div>
                                {currentHeuristic.lastTask.durationText && <Tooltip content={TOOLTIPS_DICT.LABELING_FUNCTION.EXECUTION_TIME} color="invert" placement="top">
                                    <div className="text-sm leading-5 font-normal text-gray-500 ml-2 select-none flex items-center">
                                        <IconArrowRight className="h-4 w-4 text-gray-500" />
                                        <span className="ml-2">{currentHeuristic.lastTask.durationText}</span>
                                    </div>
                                </Tooltip>}
                            </>)}
                        </div>

                        <div className="flex">
                            <div className="text-sm leading-5 font-normal text-gray-500">{currentHeuristic.lastTask.createdAtDisplay}</div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal modalName={ModalEnum.CANCEL_EXECUTION} abortButton={abortButton}>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg text-gray-900 mb-2">Cancel Execution</h1>
                    <div className="text-sm text-gray-500 my-2">
                        Are you sure you want to cancel?
                        <div>This will stop the execution and remove already created labels.</div>
                    </div>
                </div>

            </Modal>
        </>) : <>
            <div className="bg-white">
                <div className="py-6 text-sm leading-5 font-normal text-gray-500">This heuristic was not yet run.</div>
            </div>
        </>}
    </div>)
}