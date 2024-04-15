import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { removeLabelFromLabelingTask } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteLabelPost } from "@/src/services/base/labeling-tasks";

const ABORT_BUTTON = { buttonCaption: 'Delete label', disabled: false, useButton: true };

export default function DeleteLabelModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalDeleteLabel = useSelector(selectModal(ModalEnum.DELETE_LABEL));

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const deleteLabel = useCallback(() => {
        LabelHelper.removeLabel(modalDeleteLabel.taskId, modalDeleteLabel.label.color.name);
        deleteLabelPost(projectId, modalDeleteLabel.label.id, (res) => {
            dispatch(removeLabelFromLabelingTask(modalDeleteLabel.taskId, modalDeleteLabel.label.id));
        });
    }, [modalDeleteLabel]);


    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteLabel });
    }, [modalDeleteLabel]);

    return (<Modal modalName={ModalEnum.DELETE_LABEL} abortButton={abortButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Warning</div>
        <p className="mt-2 text-gray-500 text-sm text-center">Are you sure you want to delete this label?</p>
        <p className="text-gray-500 text-sm text-center">This will delete all data associated with it!</p>
    </Modal>
    )
}