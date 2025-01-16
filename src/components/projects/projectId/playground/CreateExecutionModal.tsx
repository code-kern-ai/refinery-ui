import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true };


export default function CreateExecutionModal() {
    const createExecution = useCallback(() => {

    }, []);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createExecution });
    }, [createExecution]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [question, setQuestion] = useState("");
    const [search, setSearch] = useState("");

    return <Modal modalName={ModalEnum.PLAYGROUND_EXECUTION} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Create new execution</div>
        <div className={`bg-white grid overflow-hidden min-h-full grid-cols-2`}>
            <div className="flex flex-col gap-y-2 m-3 h-full">
                <div className="flex items-center">
                    <span className="mr-4">Execution</span>
                </div>
                <textarea placeholder="Enter question..."
                    className={`placeholder-italic w-full h-44 p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`}
                    onChange={(event: any) => { setQuestion(event.target.value); }}
                    value={question}
                ></textarea>
                <div className="flex items-center">
                    <span className="mr-4">Selected results</span>
                </div>
            </div>
            <div className={`h-full border-gray-300 border-l`}>
                <div className="m-3 text-left">
                    <label>Filter by search</label>
                    <input type="text" placeholder="Search..."
                        onChange={(event: any) => { setSearch(event.target.value); }}
                        value={search}
                        className="w-full h-10 p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                    <div>Records</div>
                </div>
                {!loading && <div className="ml-2 font-dmMono text-xs whitespace-pre-line overflow-y-auto">
                    {/* <code>{output}</code> */}
                    {/* <RecordDisplay
                        attributes={attributes}
                        record={record} /> */}
                </div>}
                {loading && <div className="items-center">
                    <LoadingIcon size="lg" />
                </div>}
            </div>
        </div>
    </Modal>
}