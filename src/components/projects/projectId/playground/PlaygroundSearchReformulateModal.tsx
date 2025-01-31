import Modal from "@/src/components/shared/modal/Modal";
import { useCallback, useEffect, useState } from "react";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import ProjectsPage from "@/src/pages/projects";

const ACCEPT_BUTTON = { buttonCaption: 'Generate', useButton: true };

export default function PlaygroundSearchReformulateModal(props: { handleReformulation: () => void }) {

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        setAcceptButton({
            ...acceptButton, emitFunction: props.handleReformulation
        });
    }, [props.handleReformulation]);

    return (
        <Modal modalName={ModalEnum.EVALUATION_REFORMULATE} acceptButton={acceptButton} className="w-80">
            <h3 className="text-lg text-gray-900 font-medium mb-2">Question Improvement</h3>
            <div className="text-sm text-gray-500 my-2">Generate an LLM-assisted reformulation of your question to better align with your search intent and improve the relevance of the results.</div>
        </Modal >
    )
}