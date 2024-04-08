import Modal from "@/src/components/shared/modal/Modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { pasteKnowledgeTerms } from "@/src/services/base/lookup-lists";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Remove', useButton: true, disabled: false };

export default function RemoveLookupListModal() {
    const router = useRouter();
    const projectId = useSelector(selectProjectId);

    const [inputSplit, setInputSplit] = useState("\\n");
    const [inputArea, setInputArea] = useState("");

    const removeLookupList = useCallback(() => {
        pasteKnowledgeTerms(projectId, {
            knowledgeBaseId: router.query.lookupListId,
            values: inputArea,
            split: inputSplit,
            delete: true
        }, (res) => {
            setInputArea("");
        });
    }, [inputArea, inputSplit]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: removeLookupList });
    }, [inputArea, inputSplit]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    return (<Modal modalName={ModalEnum.REMOVE_LOOKUP_LIST} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2 font-bold text-center">Remove your terms</h1>
        <div className="grid justify-center items-center gap-x-2 gap-y-1 justify-items-start" style={{ gridTemplateColumns: 'max-content min-content' }}>
            <span>Split On</span>
            <input value={inputSplit} type="text" onInput={(e: any) => setInputSplit(e.target.value)}
                className="h-8 w-10 border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
        </div>
        <div className="mt-3" style={{ maxHeight: '80vh' }}>
            <textarea value={inputArea} onInput={(e: any) => setInputArea(e.target.value)}
                placeholder="Paste your values here. No need to check for duplication, we do that for you."
                className="leading-4 p-4 h-72 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"></textarea>
        </div>
    </Modal>)
}