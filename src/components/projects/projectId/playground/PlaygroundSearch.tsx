import { openModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { selectOnAttributeEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createEvaluationSet, getSearchResults, getReformulationByQuestion } from "@/src/services/base/playground";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import { selectVisibleAttributesDataBrowser } from "@/src/reduxStore/states/pages/settings";
import LoadingIcon from "@/submodules/react-components/components/LoadingIcon";
import { IconFilterOff, IconFilter, IconCategoryPlus, IconLoader2, IconWand } from '@tabler/icons-react'
import PlaygroundSearchMetaFilterModal from "./PlaygroundSearchMetaFilterModal";
import PlaygroundSearchReformulateModal from "./PlaygroundSearchReformulateModal";
import { Tooltip } from "@nextui-org/react";
import QuestionHistory from "./QuestionHistory";
import IconButton from "@/submodules/react-components/components/kern-button/IconButton";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";

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
    const [reformulationLoading, setReformulationLoading] = useState(false);
    const [refetchHistory, setRefetchHistory] = useState(false);

    const getSearchResultsPost = useCallback(() => {
        setLoading(true);
        getSearchResults(projectId, selectedEmbedding?.id, question, limit, metaDataFilter, threshold, true, (result) => {
            setLoading(false);
            setCreatedSet(false);
            setSearchResults(result);
            setRefetchHistory(true);
            setTimeout(() => {
                setRefetchHistory(false);
            }, 1000);
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


    return <div className="grid overflow-hidden grid-cols-2 h-[calc(100vh-150px)]">
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
                    <IconButton
                        icon={IconWand}
                        tooltip="Reformulate"
                        disabled={!question || loading}
                        onClick={() => dispatch(openModal(ModalEnum.EVALUATION_REFORMULATE))}
                        tooltipPlacement="bottom"
                    />
                    <QuestionHistory setQuestion={(question: string) => setQuestion(question)} refetchHistory={refetchHistory} />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2 justify-between">
                    <KernButton
                        onClick={() => dispatch(openModal(ModalEnum.EVALUATION_META_FILTER_APPLY))}
                        disabled={!selectedEmbedding}
                        icon={!metaDataFilter?.length ? IconFilterOff : IconFilter}
                        text="Meta"
                    />
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
                <KernButton
                    text="Search"
                    disabled={!question || loading || !selectedEmbedding}
                    onClick={getSearchResultsPost}
                />
            </div>
        </div>
        <div className="h-full border-gray-300 border-l">
            <div className="flex flex-row mx-4 my-1 items-center">
                <span className="mr-4"><span>{searchResults?.length > 0 ? searchResults.length + " " : ""}</span>Record{searchResults?.length > 1 ? "s" : ""}</span>
                <KernButton
                    text="Create set from results"
                    disabled={!searchResults || searchResults?.length === 0 || selectedEmbedding === null || question === "" || loading || createdSet}
                    onClick={createSetFromRecords}
                    icon={!setCreationLoading ? IconCategoryPlus : IconLoader2}
                    buttonColor="green"
                    iconColor="green"
                    className="ml-auto"
                />
            </div>
            {!loading && !searchResults && <div className="text-sm inline-block font-normal text-gray-500 italic mx-3">Start by searching for records.</div>}
            {!loading && searchResults && (searchResults.length > 0 ? <div className="relative ml-2 font-dmMono text-xs whitespace-pre-line h-[calc(100vh-175px)] pb-5 overflow-y-auto">
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