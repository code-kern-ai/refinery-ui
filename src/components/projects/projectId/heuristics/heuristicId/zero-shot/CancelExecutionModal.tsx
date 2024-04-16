import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectHeuristic, updateHeuristicsState } from "@/src/reduxStore/states/pages/heuristics";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { cancelZeroShot } from "@/src/services/base/zero-shot";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { Status } from "@/src/types/shared/statuses";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Cancel', useButton: true, disabled: false };

export default function CancelExecutionModal() {
    const dispatch = useDispatch();
    const projectId = useSelector(selectProjectId);
    const currentHeuristic = useSelector(selectHeuristic);
    const modalCancel = useSelector(selectModal(ModalEnum.CANCEL_EXECUTION));

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const cancelExecution = useCallback(() => {
        cancelZeroShot(projectId, currentHeuristic.id, currentHeuristic.lastTask.id, () => {
            dispatch(updateHeuristicsState(currentHeuristic.id, { lastTask: { state: Status.FAILED, iteration: currentHeuristic.lastPayload.iteration }, state: Status.FAILED }));
        });
    }, [modalCancel, projectId, currentHeuristic]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: cancelExecution });
    }, [modalCancel]);

    return (<Modal modalName={ModalEnum.CANCEL_EXECUTION} abortButton={abortButton}>
        <div className="flex flex-col items-center">
            <h1 className="text-lg text-gray-900 mb-2">Cancel Execution</h1>
            <div className="text-sm text-gray-500 my-2">
                Are you sure you want to cancel?
                <div>This will stop the execution and remove already created labels.</div>
            </div>
        </div>

    </Modal>
    )
}