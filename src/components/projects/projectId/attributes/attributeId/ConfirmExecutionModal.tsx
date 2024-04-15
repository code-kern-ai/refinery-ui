import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ConfirmExecutionModalProps } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { calculateUserAttributeAllRecordsPost } from "@/src/services/base/project-setting";

const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true };


export default function ConfirmExecutionModal(props: ConfirmExecutionModalProps) {
    const projectId = useSelector(selectProjectId);
    const modalExecuteAll = useSelector(selectModal(ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION));

    const calculateUserAttributeAllRecords = useCallback(() => {
        calculateUserAttributeAllRecordsPost(projectId, { attributeId: props.currentAttributeId }, (res) => { });
    }, [modalExecuteAll]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: calculateUserAttributeAllRecords, disabled: modalExecuteAll.requestedSomething });
    }, [modalExecuteAll]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    return (<Modal modalName={ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION} acceptButton={acceptButton}>
        <h1 className="text-lg text-gray-900 mb-2 text-center">Attribute calculation</h1>
        <div className="text-sm text-gray-500 my-2">
            This action calculates the attribute for all records.
            Be aware that calculated attributes are immutable.
            If you want to change the attribute calculation afterwards, you need to create a new
            attribute.
        </div>
    </Modal>)
}