import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { removeLabelFromLabelingTask } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { DELETE_LABEL } from "@/src/services/gql/mutations/project-settings";
import { LabelingTasksProps } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete label', disabled: false, useButton: true };

export default function DeleteLabelModal(props: LabelingTasksProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalDeleteLabel = useSelector(selectModal(ModalEnum.DELETE_LABEL));

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const [deleteLabelMut] = useMutation(DELETE_LABEL);

    const deleteLabel = useCallback(() => {
        LabelHelper.removeLabel(modalDeleteLabel.taskId, modalDeleteLabel.label.color.name);
        deleteLabelMut({ variables: { projectId: projectId, labelId: modalDeleteLabel.label.id } }).then(() => {
            dispatch(removeLabelFromLabelingTask(modalDeleteLabel.taskId, modalDeleteLabel.label.id));
        });
    }, [modalDeleteLabel]);

    useEffect(() => {
        props.refetchWS();
    }, [deleteLabel]);

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