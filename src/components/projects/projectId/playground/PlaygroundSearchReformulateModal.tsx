import Modal from "@/src/components/shared/modal/Modal";
import { useEffect, useState } from "react";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";

const ACCEPT_BUTTON = { buttonCaption: "Generate", useButton: true };

export default function PlaygroundSearchReformulateModal(props: { handleReformulation: (apiKey: string) => void }) {
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [apiKey, setApiKey] = useState("");

    useEffect(() => {
        setAcceptButton({
            ...acceptButton, disabled: apiKey.length === 0,
            emitFunction: () => props.handleReformulation(apiKey),
        });
    }, [props.handleReformulation, apiKey]);

    return (
        <Modal modalName={ModalEnum.EVALUATION_REFORMULATE} acceptButton={acceptButton} className="w-80">
            <h3 className="text-lg font-semibold mb-2">Question Improvement</h3>
            <p> Generate an LLM-assisted reformulation of your question to better align with your search intent and improve the relevance of the results.</p>
            <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="OpenAI API key"
                className="w-full p-2 mt-3 border rounded"
            />
        </Modal>
    );
}
