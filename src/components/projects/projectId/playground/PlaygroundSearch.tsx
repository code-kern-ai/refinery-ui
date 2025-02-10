import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createEvaluationSet, getSearchResults, getReformulationByQuestion, getPlaygroundQuestions, deleteQuestionFromHistory } from "@/src/services/base/playground";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import { selectVisibleAttributesDataBrowser } from "@/src/reduxStore/states/pages/settings";
import LoadingIcon from "@/submodules/react-components/components/LoadingIcon";
import { IconFilterOff, IconFilter, IconCategoryPlus, IconLoader2, IconWand, IconHistory, IconTrash, } from '@tabler/icons-react'
import PlaygroundSearchMetaFilterModal from "./PlaygroundSearchMetaFilterModal";
import PlaygroundSearchReformulateModal from "./PlaygroundSearchReformulateModal";
import { Tooltip } from "@nextui-org/react";
import { PlaygroundQuestion } from "@/src/types/components/projects/projectId/settings/playground";
import useOnClickOutside from "@/submodules/react-components/hooks/useHooks/useOnClickOutside";

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
    const [questionHistory, setQuestionHistory] = useState<PlaygroundQuestion[]>();
    const [showHistory, setShowHistory] = useState(false);
    const [reformulationLoading, setReformulationLoading] = useState(false);

    const dropdownRef = useRef(null);
    useOnClickOutside(dropdownRef, () => { setShowHistory(false) });

    const getSearchResultsPost = useCallback(() => {
        setLoading(true);
        getSearchResults(projectId, selectedEmbedding?.id, question, limit, metaDataFilter, threshold, true, (result) => {
            setLoading(false);
            setCreatedSet(false);
            setSearchResults(result);
            refetchQuestionMemory();
        });
    }, [projectId, selectedEmbedding?.id, question, limit, metaDataFilter, threshold]);


    const createSetFromRecords = useCallback(() => {
        setSetCreationLoading(true);
        if (createdSet) {
            setSetCreationLoading(false);
            return;
        }
        setCreatedSet(true);
        createEvaluationSet(projectId, question, searchResults.map((record) => record.id), (result) => {
            setTimeout(() => {
                setSetCreationLoading(false);
            }, 1500);

        });
    }, [projectId, question, searchResults, createdSet]);

    const handleHistoryClick = useCallback((entry: string) => {
        setQuestion(entry);
        setShowHistory(false);
    }, []);

    const handleReformulation = useCallback((apiKey) => {
        setReformulationLoading(true);
        getReformulationByQuestion(projectId, question, apiKey, (result) => {
            if (!result?.reformulation) setQuestion("Error reformulating question.");
            else setQuestion(result?.reformulation);
            setReformulationLoading(false);
        },
            (error) => {
                setReformulationLoading(false);
                setQuestion("Error reformulating question.");
            }
        )
    }, [projectId, question]);

    useEffect(() => {
        if (!projectId) return;
        refetchQuestionMemory();
    }, [projectId]);

    function refetchQuestionMemory() {
        getPlaygroundQuestions(projectId, (result) => {
            setQuestionHistory(result);
        });
    }

    function deleteQuestionFromHistoryFunc(questionId: string) {
        deleteQuestionFromHistory(projectId, questionId, (result) => {
            refetchQuestionMemory();
        });
    }

    return <div className="grid overflow-hidden grid-cols-2 h-[calc(100vh-200px)]">
        <div className="flex flex-col gap-y-2 m-3 h-full">
            <div className="flex items-center">
                <span className="mr-3">Embedding</span>
                <KernDropdown dropdownWidth={"w-full"} options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(value) => setSelectedEmbedding(value)} dropdownClasses="my-2" />
            </div>
            <div className="relative w-full">
                <textarea
                    placeholder="Enter question..."
                    className="placeholder-italic w-full h-44 p-2 pr-16 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onChange={(event: any) => setQuestion(event.target.value)}
                    value={question}
                ></textarea>
                {reformulationLoading && <span className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><IconLoader2 className="absolute h-6 w-6 animate-spin" /></span>}
                <div className="absolute top-2 right-2 flex gap-x-2">
                    <Tooltip content="Reformulate" color="invert" placement="bottom">
                        <button disabled={!question || loading}
                            className="p-1 rounded-md text-gray-400 cursor-pointer hover:bg-gray-100 hover:text-gray-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => dispatch(openModal(ModalEnum.EVALUATION_REFORMULATE))}>
                            <IconWand className="h-5 w-5" />
                        </button>
                    </Tooltip>
                    <Tooltip content="History" color="invert" placement="bottom">
                        <button
                            className="p-1 rounded-md text-gray-400 cursor-pointer hover:bg-gray-100 hover:text-gray-500 transition duration-150 ease-in-out"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowHistory(!showHistory);
                            }}
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        >
                            <IconHistory className="h-5 w-5" />
                        </button>
                    </Tooltip>
                    {showHistory && (
                        <div ref={dropdownRef} className="absolute top-8 right-0 w-80 bg-gray-100 border border-gray-300 shadow-lg rounded-md p-2 z-50 max-h-96 overflow-y-auto">
                            <div className="ml-1 text-md text-black mb-1">Last questions</div>
                            <ul>
                                {questionHistory && questionHistory.map((questionEntry, index) => (
                                    <div key={questionEntry.id} className="p-2 flex items-center rounded-md border-2 border-white cursor-pointer transition duration-150 bg-white my-2 hover:border-black">
                                        <li
                                            className=" text-gray-700 "
                                            onClick={() => handleHistoryClick(questionEntry.question)}
                                        >
                                            {questionEntry.question}
                                        </li>
                                        <IconTrash onClick={() => deleteQuestionFromHistoryFunc(questionEntry.id)}
                                            className="h-6 w-6 text-red-700 cursor-pointer ml-auto" />
                                    </div>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
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
        <div className="h-full border-gray-300 border-l">
            <div className="flex flex-row mx-4 my-1 items-center">
                <span className="mr-4"><span>{searchResults?.length > 0 ? searchResults.length + " " : ""}</span>Record{searchResults?.length > 1 ? "s" : ""}</span>
                <button disabled={!searchResults || searchResults?.length === 0 || selectedEmbedding === null || question === "" || loading || createdSet}
                    className="flex items-center ml-auto gap-x-2 bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-3 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={createSetFromRecords}>
                    {!setCreationLoading ? <span><IconCategoryPlus className="ml-1 h-4 w-4" /></span> :
                        <span><IconLoader2 className="ml-1 h-4 w-4 animate-spin" /></span>}
                    Create set from results
                </button>
            </div>
            {!loading && !searchResults && <div className="text-sm inline-block font-normal text-gray-500 italic mx-3">Start by searching for records.</div>}
            {!loading && searchResults && (searchResults.length > 0 ? <div className="relative ml-2 font-dmMono text-xs whitespace-pre-line h-[calc(100vh-200px)] overflow-y-auto">
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
        <PlaygroundSearchReformulateModal handleReformulation={handleReformulation} />
    </div >
}