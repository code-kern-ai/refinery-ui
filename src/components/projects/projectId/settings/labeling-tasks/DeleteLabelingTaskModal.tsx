import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { removeFromAllLabelingTasksById } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteLabelingTask as dlt } from "@/src/services/base/labeling";

const ABORT_BUTTON = { buttonCaption: 'Delete labeling task', disabled: false, useButton: true };

export default function DeleteLabelingTaskModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalDeleteLabelingTask = useSelector(selectModal(ModalEnum.DELETE_LABELING_TASK));

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const deleteLabelingTask = useCallback(() => {
        dlt(projectId, modalDeleteLabelingTask.taskId, (res) => {
            dispatch(removeFromAllLabelingTasksById(modalDeleteLabelingTask.taskId));
        });
    }, [modalDeleteLabelingTask]);


    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteLabelingTask });
    }, [modalDeleteLabelingTask]);

    return (<Modal modalName={ModalEnum.DELETE_LABELING_TASK} abortButton={abortButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Warning </div>
        <p className="mt-2 text-gray-500 text-sm">Are you sure you want to delete this labeling task?</p>
        <p className="text-gray-500 text-sm">This will delete all data associated with it, including heuristics and labels!</p>
    </Modal>)
}