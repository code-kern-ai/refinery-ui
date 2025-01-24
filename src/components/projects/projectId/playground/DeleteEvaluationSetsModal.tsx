import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { deleteEvaluationSetsPost } from "@/src/services/base/playground";
import { selectProjectId } from "@/src/reduxStore/states/project";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

type DeleteEvaluationSetsModalProps = {
    refetchEvaluationSets: () => void;
};
export default function DeleteEvaluationSetsModal(props: DeleteEvaluationSetsModalProps) {
    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const projectId = useSelector(selectProjectId);
    const modalDeleteEvaluationSet = useSelector(selectModal(ModalEnum.DELETE_EVALUATION_SET));

    const deleteEvaluationSets = useCallback(() => {
        deleteEvaluationSetsPost(projectId, modalDeleteEvaluationSet.evaluationSetIds, (res) => {
            props.refetchEvaluationSets();
        });
    }, [modalDeleteEvaluationSet]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteEvaluationSets });
    }, [modalDeleteEvaluationSet]);

    return (
        <Modal modalName={ModalEnum.DELETE_EVALUATION_SET} abortButton={abortButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Warning
            </div>
            <p className="mt-2 text-gray-500 text-sm">Are you sure you want to delete this evaluation set(s)?</p>
        </Modal>)
}
