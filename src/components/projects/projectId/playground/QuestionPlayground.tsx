import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { ModalEnum } from "@/src/types/shared/modal";
import { openModal } from "@/src/reduxStore/states/modal";
import CreateExecutionModal from "./CreateExecutionModal";


export default function QuestionPlayground() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);

    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const [question, setQuestion] = useState("");

    return <>
        {projectId && <div className={`bg-white grid overflow-hidden min-h-full h-[calc(100vh-4rem)] grid-cols-2`}>
            <div className="flex flex-col gap-y-2 m-3 h-full">
                <div className="flex items-center">
                    <span className="mr-4">Playground</span>
                    <KernDropdown dropdownWidth={"w-full"} options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(value) => setSelectedEmbedding(value)} dropdownClasses="my-2" />
                </div>
                <textarea placeholder="Enter question..."
                    className={`placeholder-italic w-full h-44 p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`}
                    onChange={(event: any) => { setQuestion(event.target.value); }}
                    value={question}
                ></textarea>
                <div className="flex items-center">
                    <button
                        className={`ml-2 bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                        onClick={() => dispatch(openModal(ModalEnum.PLAYGROUND_EXECUTION))}>Create execution</button>
                    <button disabled={!question || loading || !selectedEmbedding} onClick={() => { }}
                        className="ml-auto w-44 bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                        Search
                    </button>
                </div>

            </div>
            <div className={`h-full border-gray-300 border-l`}>
                <div className="flex flex-row m-3 items-center">
                    <span className="mr-4">Records</span>
                </div>
                {!loading && <div className="ml-2 font-dmMono text-xs whitespace-pre-line overflow-y-auto">
                    <code>{output}</code>
                </div>}
                {loading && <div className="items-center">
                    <LoadingIcon size="lg" />
                </div>}
            </div>
        </div>}
        <CreateExecutionModal />
    </>
}