import Modal from "@/src/components/shared/modal/Modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { UPDATE_PROJECT_FOR_GATES } from "@/src/services/gql/mutations/project-settings";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true, disabled: false };

export default function GatesIntegrationWarningModal() {
    const projectId = useSelector(selectProjectId);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const [updateProjectsGatesMut] = useMutation(UPDATE_PROJECT_FOR_GATES);

    const updateProjectForGates = useCallback(() => {
        updateProjectsGatesMut({ variables: { projectId: projectId } })
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