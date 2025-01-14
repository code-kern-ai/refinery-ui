import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { selectProjectId } from "@/src/reduxStore/states/project"
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";

import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";

export default function RecordIDE() {
    const dispatch = useDispatch();
    const router = useRouter();
    const projectId = useSelector(selectProjectId);
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");
    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);
    const [question, setQuestion] = useState("");

    return (<>
        {projectId && <div className={`bg-white grid overflow-hidden min-h-full h-[calc(100vh-4rem)] grid-cols-2`}>
            <div className="flex flex-col gap-y-2 m-3 h-full">
                <div className="flex items-center">
                    <span className="mr-4">Playground</span>
                    <KernDropdown dropdownWidth={"w-96"} options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(value) => setSelectedEmbedding(value)} dropdownClasses="my-2" />
                </div>
                <textarea placeholder="Enter question..."
                    className={`placeholder-italic w-full h-44 p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`}
                    onChange={(event: any) => { setQuestion(event.target.value); }}
                    value={question}
                ></textarea>
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
    </>)
}