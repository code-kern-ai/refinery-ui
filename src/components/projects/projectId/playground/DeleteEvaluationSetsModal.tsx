import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteEvaluationSetsPost } from "@/src/services/base/playground";

import { selectProjectId } from "@/src/reduxStore/states/project";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export default function DeleteEvaluationSetsModal() {
    const dispatch = useDispatch();

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const projectId = useSelector(selectProjectId);
    const modalDeleteEvaluationSet = useSelector(selectModal(ModalEnum.DELETE_EVALUATION_SET));

    const deleteEvaluationSets = useCallback(() => {
        deleteEvaluationSetsPost(projectId, modalDeleteEvaluationSet.evaluationSetIds, (res) => {

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
