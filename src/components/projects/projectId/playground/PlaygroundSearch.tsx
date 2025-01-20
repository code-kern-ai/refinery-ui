import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { getSearchResults } from "@/src/services/base/playground";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import { selectVisibleAttributesDataBrowser } from "@/src/reduxStore/states/pages/settings";


export function PlaygroundSearch() {
    const projectId = useSelector(selectProjectId);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);
    const attributes = useSelector(selectVisibleAttributesDataBrowser);

    const [loading, setLoading] = useState(false);
    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const [question, setQuestion] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [limit, setLimit] = useState(10);

    function getSearchResultsPost() {
        setLoading(true);
        getSearchResults(projectId, selectedEmbedding.id, question, limit, (result) => {
            setLoading(false);
            setSearchResults(result);
        });
    }

    return <div className={`grid overflow-hidden h-full grid-cols-2`}>
        <div className="flex flex-col gap-y-2 m-3 h-full">
            <div className="flex items-center">
                <span className="mr-3">Embedding</span>
                <KernDropdown dropdownWidth={"w-full"} options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(value) => setSelectedEmbedding(value)} dropdownClasses="my-2" />
            </div>
            <textarea placeholder="Enter question..."
                className={`placeholder-italic w-full h-44 p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`}
                onChange={(event: any) => { setQuestion(event.target.value); }}
                value={question}
            ></textarea>
            <div className="flex items-center justify-between">
                <div>Limit
                    <input className="ml-2 w-14 bg-white text-gray-700 text-xs font-semibold px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                        onChange={(event: any) => { setLimit(Number(event.target.value)); }}
                        value={limit}>
                    </input>
                </div>
                <button disabled={!question || loading || !selectedEmbedding} onClick={getSearchResultsPost}
                    className="ml-auto w-44 bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    Search
                </button>
            </div>

        </div>
        <div className={`h-full border-gray-300 border-l`}>
            <div className="flex flex-row m-2 items-center">
                <span className="mr-4"><span>{searchResults.length > 0 ? searchResults.length + " " : ""}</span>Records</span>
            </div>
            {!loading && (searchResults?.length > 0 ? <div className="ml-2 font-dmMono text-xs whitespace-pre-line overflow-y-auto">
                {searchResults.map((result, index) => <div key={index} className="flex flex-col gap-x-3 bg-white rounded-md border border-gray-300 py-2 px-3 m-2">
                    <RecordDisplay record={result} attributes={attributes} />
                </div>)}

            </div> : <div className="text-sm inline-block font-normal text-gray-500 italic mx-3">
                No records searched yet.
            </div>)}
            {loading && <div className="flex w-full justify-center items-center mt-4">
                <LoadingIcon size="lg" />
            </div>}
        </div>
    </div >
}