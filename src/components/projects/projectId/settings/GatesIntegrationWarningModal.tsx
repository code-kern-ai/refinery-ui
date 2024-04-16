import Modal from "@/src/components/shared/modal/Modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { updateProjectGates } from "@/src/services/base/project-setting";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true, disabled: false };

export default function GatesIntegrationWarningModal() {
    const projectId = useSelector(selectProjectId);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const updateProjectForGates = useCallback(() => {
        updateProjectGates(projectId, (res) => { });
    }, []);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: updateProjectForGates });
    }, [updateProjectForGates]);

    return (<Modal modalName={ModalEnum.GATES_INTEGRATION_WARNING} acceptButton={acceptButton}>
        <h1 className="text-lg text-gray-900 mb-2">Confirmation</h1>
        <div className="text-sm text-gray-500 my-2">
            Are you sure you want to run the gates integration?
            <p>Recreation of the
                embeddings will calculate them one more time and could cause additional fees.</p>
        </div>
    </Modal>
    )
}