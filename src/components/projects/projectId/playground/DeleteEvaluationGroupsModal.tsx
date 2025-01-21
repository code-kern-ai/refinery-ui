import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteEvaluationGroupsPost } from "@/src/services/base/playground";

import { selectProjectId } from "@/src/reduxStore/states/project";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

type DeleteEvaluationGroupsModalProps = {
    refetchEvaluationGroups: () => void;
};
export default function DeleteEvaluationGroupsModal(props: DeleteEvaluationGroupsModalProps) {
    const dispatch = useDispatch();

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);
    const projectId = useSelector(selectProjectId);
    const modalDeleteEvaluationGroup = useSelector(selectModal(ModalEnum.DELETE_EVALUATION_GROUP));

    const deleteEvaluationGroups = useCallback(() => {
        deleteEvaluationGroupsPost(projectId, modalDeleteEvaluationGroup.evaluationGroupIds, (res) => {
            props.refetchEvaluationGroups();
        });
    }, [modalDeleteEvaluationGroup]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteEvaluationGroups });
    }, [modalDeleteEvaluationGroup]);

    return (
        <Modal modalName={ModalEnum.DELETE_EVALUATION_GROUP} abortButton={abortButton}>
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                Warning
            </div>
            <p className="mt-2 text-gray-500 text-sm">Are you sure you want to delete this evaluation group(s)?</p>
        </Modal>)
}
