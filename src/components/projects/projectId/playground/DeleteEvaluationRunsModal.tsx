import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteEvaluationRunsPost } from "@/src/services/base/playground";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

type DeleteEvaluationRunsModalProps = {
    refetchEvaluationRuns: () => void;
};
export default function DeleteEvaluationRunsModal(props: DeleteEvaluationRunsModalProps) {
    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const projectId = useSelector(selectProjectId);
    const modalDeleteEvaluationRun = useSelector(selectModal(ModalEnum.DELETE_EVALUATION_RUN));

    const deleteEvaluationRuns = useCallback(() => {
        deleteEvaluationRunsPost(projectId, modalDeleteEvaluationRun.evaluationRunIds, (res) => {
            props.refetchEvaluationRuns();
        });
    }, [modalDeleteEvaluationRun, props.refetchEvaluationRuns]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteEvaluationRuns });
    }, [modalDeleteEvaluationRun]);

    return (
        <Modal modalName={ModalEnum.DELETE_EVALUATION_RUN} abortButton={abortButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Warning
            </div>
            <p className="mt-2 text-gray-500 text-sm">Are you sure you want to delete this evaluation run(s)?</p>
        </Modal>)
}
