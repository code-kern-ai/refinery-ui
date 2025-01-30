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
            <h3 className="text-lg font-semibold mb-2">Question Improvement</h3>
            <p> Generate an LLM-assisted reformulation of your question to better align with your search intent and improve the relevance of the results.</p>
        </Modal >
    )
}