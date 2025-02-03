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
            <h3 className="ext-lg text-gray-900 font-medium mb-2">Question Improvement</h3>
            <div className="text-sm text-gray-500 my-2">Generate an LLM-assisted reformulation of your question to better align with your search intent and improve the relevance of the results.</div>            <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="OpenAI API key"
                className="w-full p-2 mt-3 border h-9 text-sm border-gray-300 rounded-md placeholder-italic text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
            />
        </Modal>
    );
}
