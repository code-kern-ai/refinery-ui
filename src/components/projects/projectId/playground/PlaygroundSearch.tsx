import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createEvaluationSet, getSearchResults } from "@/src/services/base/playground";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import { selectVisibleAttributesDataBrowser } from "@/src/reduxStore/states/pages/settings";
import LoadingIcon from "@/submodules/react-components/components/LoadingIcon";
import { IconFilterOff, IconFilter, IconCategoryPlus, IconLoader2 } from '@tabler/icons-react'
import PlaygroundSearchMetaFilterModal from "./PlaygroundSearchMetaFilterModal";

const PLAYGROUND_LIMIT_DEFAULT = 10;
const PLAYGROUND_THRESHOLD_DEFAULT = -9999;

export function PlaygroundSearch() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);
    const attributes = useSelector(selectVisibleAttributesDataBrowser);

    const [loading, setLoading] = useState(false);
    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const [question, setQuestion] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [limit, setLimit] = useState(PLAYGROUND_LIMIT_DEFAULT);
    const [threshold, setThreshold] = useState(PLAYGROUND_THRESHOLD_DEFAULT);
    const [metaDataFilter, setMetaDataFilter] = useState(null);

    const [setCreationLoading, setSetCreationLoading] = useState(false);
    const [createdSet, setCreatedSet] = useState(false);

    const getSearchResultsPost = useCallback(() => {
        setLoading(true);
        getSearchResults(projectId, selectedEmbedding?.id, question, limit, metaDataFilter, threshold, (result) => {
            setLoading(false);
            setCreatedSet(false);
            setSearchResults(result);
        });
    }, [projectId, selectedEmbedding?.id, question, limit, metaDataFilter, threshold]);


    const createSetFromRecords = useCallback(() => {
        setSetCreationLoading(true);
        if (createdSet) return;
        setCreatedSet(true);
        createEvaluationSet(projectId, question, searchResults.map((record) => record.id), (result) => {
            setTimeout(() => {
                setSetCreationLoading(false);
            }, 1500);

        });
    }, [projectId, question, searchResults, createdSet]);


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
                <div className="flex items-center gap-x-2 justify-between">
                    <button onClick={() => dispatch(openModal(ModalEnum.EVALUATION_META_FILTER_APPLY))} disabled={!selectedEmbedding}
                        className="flex items-center bg-white text-gray-700 text-xs font-semibold px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                        Meta
                        {!metaDataFilter ? <span><IconFilterOff className="ml-1 h-4 w-4 text-gray-400" /></span> :
                            <span><IconFilter className="ml-1 h-4 w-4 text-kernpurple" /></span>}
                    </button>
                    <div className="flex items-center gap-x-2">
                        <span>Limit</span>
                        <input className="w-14 bg-white text-gray-700 text-xs font-semibold px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                            onChange={(event: any) => { setLimit(Number(event.target.value)); }}
                            value={limit}>
                        </input>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <span>Threshold</span>
                        <input type="number" className="w-14 bg-white text-gray-700 text-xs font-semibold px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                            onChange={(event: any) => { setThreshold(Number(event.target.value)); }}
                            value={threshold}>
                        </input>
                    </div>
                </div>
                <button disabled={!question || loading || !selectedEmbedding} onClick={getSearchResultsPost}
                    className="ml-auto w-44 bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    Search
                </button>
            </div>

        </div>
        <div className={`h-full border-gray-300 border-l`}>
            <div className="flex flex-row mx-4 my-1 items-center">
                <span className="mr-4"><span>{searchResults?.length > 0 ? searchResults.length + " " : ""}</span>Record{searchResults?.length > 1 ? "s" : ""}</span>
                <button disabled={!searchResults || searchResults?.length === 0 || selectedEmbedding === null || question === "" || loading || createdSet}
                    className={`flex items-center ml-auto gap-x-2 bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-3 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={createSetFromRecords}>
                    {!setCreationLoading ? <span><IconCategoryPlus className="ml-1 h-4 w-4" /></span> :
                        <span><IconLoader2 className="ml-1 h-4 w-4 animate-spin" /></span>}
                    Create set from results
                </button>
            </div>
            {!loading && !searchResults && <div className="text-sm inline-block font-normal text-gray-500 italic mx-3">Start by searching for records.</div>}
            {!loading && searchResults && (searchResults.length > 0 ? <div className="relative ml-2 font-dmMono text-xs whitespace-pre-line overflow-y-auto">
                {searchResults.map((result, index) => <div key={index} className="flex flex-col gap-x-3 bg-white rounded-md border border-gray-300 py-2 px-3 m-2">
                    <div className="absolute right-4 text-gray-500 text-xs">{result?.score.toFixed(3)}</div>
                    <RecordDisplay record={result} attributes={attributes} />
                </div>)}

            </div> : <div className="text-sm inline-block font-normal text-gray-500 italic mx-3">
                No records found.
            </div>)}
            {loading && <div className="flex w-full justify-center items-center mt-4">
                <LoadingIcon size="lg" />
            </div>}
        </div>
        <PlaygroundSearchMetaFilterModal selectedEmbedding={selectedEmbedding} setMetaDataFilter={setMetaDataFilter} />
    </div >
}