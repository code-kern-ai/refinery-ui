import Modal from "@/src/components/shared/modal/Modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { PASTE_TERM } from "@/src/services/gql/mutations/lookup-lists";
import { LookupListOperationsProps } from "@/src/types/components/projects/projectId/lookup-lists";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Add', useButton: true, disabled: false };

export default function PasteLookupListModal(props: LookupListOperationsProps) {
    const router = useRouter();
    const projectId = useSelector(selectProjectId);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [inputSplit, setInputSplit] = useState("\\n");
    const [inputArea, setInputArea] = useState("");

    const [pasteLookupListMut] = useMutation(PASTE_TERM);

    const pasteLookupList = useCallback(() => {
        pasteLookupListMut({ variables: { projectId: projectId, knowledgeBaseId: router.query.lookupListId, values: inputArea, split: inputSplit, delete: false } }).then((res) => {
            setInputArea("");
        });
    }, [inputArea, inputSplit]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: pasteLookupList });
    }, [inputArea, inputSplit]);

    useEffect(() => {
        props.refetchWS();
    }, [pasteLookupList]);

    return (<Modal modalName={ModalEnum.PASTE_LOOKUP_LIST} acceptButton={acceptButton}>
        <h1 className="text-lg text-gray-900 mb-2 font-bold text-center">Paste your terms</h1>
        <div className="grid justify-center items-center gap-x-2 gap-y-1 justify-items-start" style={{ gridTemplateColumns: 'max-content min-content' }}>
            <span>Split On</span>
            <input value={inputSplit} type="text" onInput={(e: any) => setInputSplit(e.target.value)}
                className="h-8 w-10 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
        </div>
        <div className="mt-3" style={{ maxHeight: '80vh' }}>
            <textarea value={inputArea} onInput={(e: any) => setInputArea(e.target.value)}
                placeholder="Paste your values here. No need to check for duplication, we do that for you."
                className="leading-4 p-4 h-72 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"></textarea>
        </div>
    </Modal>)
}