import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_LABEL } from "@/src/services/gql/mutations/labeling";
import { LabelingTasksProps } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Add label', useButton: true, closeAfterClick: false };

export default function AddLabelModal(props: LabelingTasksProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalAddLabel = useSelector(selectModal(ModalEnum.ADD_LABEL));

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const [createLabelMut] = useMutation(CREATE_LABEL);

    const addLabel = useCallback(() => {
        const labelColor = LabelHelper.addLabel(modalAddLabel.taskId, modalAddLabel.labelName);
        dispatch(setModalStates(ModalEnum.ADD_LABEL, { ...modalAddLabel, labelName: '', open: true }));
        createLabelMut({ variables: { projectId: projectId, labelingTaskId: modalAddLabel.taskId, labelName: modalAddLabel.labelName, labelColor: labelColor } }).then((res) => {
        })
    }, [modalAddLabel]);

    useEffect(() => {
        props.refetchWS();
    }, [addLabel]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: addLabel, disabled: modalAddLabel.labelName == '' || !LabelHelper.isLabelNameUnique(modalAddLabel.taskId, modalAddLabel.labelName) });
    }, [modalAddLabel]);

    return (<Modal modalName={ModalEnum.ADD_LABEL} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Enter your labels </div>
        <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
            You can add press enter to add a label</div>
        <input value={modalAddLabel.labelName} placeholder="Enter labels"
            onChange={(event: any) => dispatch(setModalStates(ModalEnum.ADD_LABEL, { ...modalAddLabel, labelName: event.target.value }))}
            onKeyDown={(event) => {
                if (event.key == 'Enter') addLabel();
            }} className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
    </Modal>)
}