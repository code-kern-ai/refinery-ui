import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createLabel } from "@/src/services/base/labeling-tasks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelHelper } from "@/src/util/classes/label-helper";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Add label', useButton: true, closeAfterClick: false };

export default function AddLabelModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalAddLabel = useSelector(selectModal(ModalEnum.ADD_LABEL));

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [labelName, setLabelName] = useState('');

    const addLabel = useCallback(() => {
        const labelColor = LabelHelper.addLabel(modalAddLabel.taskId, labelName);
        dispatch(setModalStates(ModalEnum.ADD_LABEL, { ...modalAddLabel, open: true }));
        createLabel(projectId, labelName, modalAddLabel.taskId, labelColor, (res) => {
            setLabelName('');
        });
    }, [modalAddLabel, labelName, modalAddLabel.taskId]);


    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: addLabel, disabled: labelName == '' || !LabelHelper.isLabelNameUnique(modalAddLabel.taskId, labelName) });
    }, [modalAddLabel, labelName, modalAddLabel.taskId]);

    return (<Modal modalName={ModalEnum.ADD_LABEL} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Enter your labels </div>
        <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
            You can add press enter to add a label</div>
        <input value={labelName} placeholder="Enter labels"
            onChange={(event: any) => setLabelName(event.target.value)}
            onKeyDown={(event) => {
                if (event.key == 'Enter') addLabel();
            }} className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
    </Modal>)
}