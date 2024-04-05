import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { deletePersonalToken } from "@/src/services/base/project";
import { PersonalTokenModalProps } from "@/src/types/components/projects/projectId/project-admin";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete personal access token', useButton: true, disabled: false };

export default function DeletePersonalToken(props: PersonalTokenModalProps) {
    const projectId = useSelector(selectProjectId);
    const modalDeleteToken = useSelector(selectModal(ModalEnum.DELETE_PERSONAL_TOKEN));

    const deletePersonalAccessToken = useCallback(() => {
        deletePersonalToken(projectId, modalDeleteToken.tokenId, (res) => {
            props.refetchTokens();
        });
    }, [modalDeleteToken.tokenId, projectId]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deletePersonalAccessToken });
    }, [modalDeleteToken]);

    return (<Modal modalName={ModalEnum.DELETE_PERSONAL_TOKEN} abortButton={abortButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Warning</div>
        <p className="mt-2 text-gray-500 text-sm">Are you sure you want to delete this personal access token?</p>
        <p className="text-gray-500 text-sm font-bold">
            This is not reversible and the token will not be longer usable!
        </p>
    </Modal>)
}