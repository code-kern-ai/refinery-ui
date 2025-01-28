import Modal from "@/src/components/shared/modal/Modal";
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectOnAttributeEmbeddings, selectVisibleAttributesDataBrowser } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createEvaluationSet, getSearchResults, recordSearchContains } from "@/src/services/base/playground";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import useDebounce from "@/submodules/react-components/hooks/useHooks/useDebounce";
import { Loading } from "@nextui-org/react";
import { IconPlus, IconWand } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true };
const SEARCH_REQUEST = { offset: 0, limit: 20 };

type CreateEvaluationSetsModalProps = {
    refetchEvaluationSets: () => void;
};

export default function CreateEvaluationSetModal(props: CreateEvaluationSetsModalProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectVisibleAttributesDataBrowser);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [question, setQuestion] = useState("");
    const [search, setSearch] = useState("");
    const [searchRequest, setSearchRequest] = useState(SEARCH_REQUEST);
    const [recordList, setRecordList] = useState<any[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const [limit, setLimit] = useState(10);
    const [similarityRecordList, setSimilarityRecordList] = useState<any[]>([]);
    const [showSimilarityRecordsList, setShowSimilarityRecordsList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addedSimilarityRecords, setAddedSimilarityRecords] = useState<any[]>([]);

    const debouncedSearch = useDebounce(search, 1000);

    const evaluationSetModalState = useSelector(selectModal(ModalEnum.EVALUATION_SET));

    useEffect(() => {
        if (!evaluationSetModalState.open) {
            resetState();
        }
    }, [evaluationSetModalState.open, dispatch]);

    const createEvaluationSetPost = useCallback(() => {
        createEvaluationSet(projectId, question, selectedRecords.map((record) => record.id), (res) => {
            resetState();
            props.refetchEvaluationSets();
        });
    }, [question, selectedRecords, projectId]);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createEvaluationSetPost, disabled: selectedRecords.length === 0 || question === "" });
    }, [createEvaluationSetPost, selectedRecords, question]);

    useEffect(() => {
        if (!searchRequest || !projectId) return;
        recordSearchContains(projectId, search, searchRequest.offset, searchRequest.limit, (res) => {
            setRecordList([...recordList, ...res]);
        });
    }, [searchRequest, projectId]);

    useEffect(() => {
        recordSearchContains(projectId, search, searchRequest.offset, searchRequest.limit, (res) => {
            const selectedRecordIds = new Set(selectedRecords.map(r => r.id));
            const newRecordList = res.filter((item) => !selectedRecordIds.has(item.id));
            setRecordList(newRecordList);
        });
    }, [debouncedSearch]);

    const refetchMoreRecords = useCallback((e: any) => {
        if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
            setSearchRequest({ ...searchRequest, offset: searchRequest.offset + searchRequest.limit, limit: searchRequest.limit });
        }
    }, [recordList, searchRequest, projectId]);

    useEffect(() => {
        setSearchRequest(SEARCH_REQUEST);
    }, [search]);

    function getSimilarRecords() {
        setLoading(true);
        getSearchResults(projectId, selectedEmbedding.id, question, limit, null, (result) => {
            const selectedRecordIds = new Set(selectedRecords.map(r => r.id));
            const newSimilarityRecordList = result.filter((item) => !selectedRecordIds.has(item.id));
            setSimilarityRecordList(newSimilarityRecordList);
            setShowSimilarityRecordsList(true)
            setLoading(false);
        });
    }

    function resetState() {
        setQuestion("");
        setSearch("");
        setSelectedRecords([]);
        setSelectedRecords([]);
        setSelectedEmbedding(null);
        setLimit(10);
        setSimilarityRecordList([]);
        setShowSimilarityRecordsList(false);
        setLoading(false);
        setAddedSimilarityRecords([]);
    }

    return <Modal modalName={ModalEnum.EVALUATION_SET} acceptButton={acceptButton} className="md:max-w-6xl">
        <div className="h-full">
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Create new evaluation set</div>
            <div className={`bg-white grid overflow-hidden min-h-full grid-cols-2`}>
                <div className="flex flex-col gap-y-2 m-3 h-full">
                    <div className="flex items-center">
                        <span className="mr-3">Embedding</span>
                        <KernDropdown dropdownWidth={"w-full"} options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(value) => setSelectedEmbedding(value)} dropdownClasses="my-2" />
                    </div>
                    <div className="flex items-center">
                        <span className="mr-4">Enter an evaluation question</span>
                    </div>
                    <textarea placeholder="Enter question..."
                        className={`placeholder-italic w-full h-22 p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`}
                        onChange={(event: any) => { setQuestion(event.target.value); }}
                        value={question}
                    ></textarea>
                    <div className="flex items-center gap-x-2">
                        <span>Limit</span>
                        <input className="w-14 bg-white text-gray-700 text-xs font-semibold px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                            onChange={(event: any) => { setLimit(Number(event.target.value)); }}
                            value={limit}>
                        </input>
                        <KernButton
                            text={"Run similarity search"}
                            icon={IconWand}
                            iconColor='purple'
                            disabled={question === '' || !selectedEmbedding}
                            onClick={() => {
                                getSimilarRecords()
                            }}
                        />
                        <KernButton
                            text={"Add all similar"}
                            icon={IconPlus}
                            iconColor='green'
                            disabled={showSimilarityRecordsList === false}
                            onClick={() => {
                                const newSelectedRecordsList = [...selectedRecords, ...similarityRecordList];
                                const selectedRecordIds = new Set(similarityRecordList.map(record => record.id));
                                const newRecordList = recordList.filter((item) => !selectedRecordIds.has(item.id));
                                const newSimilarityRecordList = similarityRecordList.filter((item) => !selectedRecordIds.has(item.id));
                                setAddedSimilarityRecords(prevRecords => [...prevRecords, ...similarityRecordList]);
                                setSelectedRecords(newSelectedRecordsList);
                                setSimilarityRecordList(newSimilarityRecordList);
                                setRecordList(newRecordList);

                                if (newSimilarityRecordList.length === 0) {
                                    setShowSimilarityRecordsList(false)
                                }
                            }}
                        />
                    </div>
                    <div className="flex items-center pt-5">
                        <span className="mr-4">{selectedRecords.length === 0 ? '' : 'Results'}</span>
                    </div>
                    <div style={{
                        maxHeight: 'calc(100vh - 500px)',
                        overflowY: 'auto',
                    }}>
                        {selectedRecords && selectedRecords.map((record, index) => (<div key={record.id} className="bg-white overflow-hidden shadow rounded-lg border p-2 relative hover:border-red-400 hover:border-opacity-50 cursor-pointer transition-all duration-200 ease-in-out my-4">
                            <RecordDisplay
                                attributes={attributes}
                                record={record}
                                onClick={() => {
                                    const isInSimilarityRecords = addedSimilarityRecords.some(item => item.id === record.id);

                                    if (isInSimilarityRecords) {
                                        setSimilarityRecordList([...similarityRecordList, record])
                                    } else {
                                        setRecordList([...recordList, record]);
                                    }

                                    const newSelectedRecords = selectedRecords.filter((item) => item.id !== record.id);
                                    setSelectedRecords(newSelectedRecords);
                                }} />
                        </div >))}
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loading size="md" type="spinner" color="currentColor" />
                    </div>
                ) : showSimilarityRecordsList ? (
                    <div className={`h-full border-gray-300 border-l`}>
                        <div className="m-3 flex justify-end">
                            <KernButton
                                text="Clear"
                                onClick={() => {
                                    setShowSimilarityRecordsList(false)
                                }}
                            />
                        </div>
                        <div style={{
                            maxHeight: 'calc(100vh - 300px)',
                            overflowY: 'auto',
                        }}>
                            {similarityRecordList && similarityRecordList.map((record, index) => (
                                <div key={record.id} className="bg-purple-100 overflow-hidden shadow rounded-lg border m-4 p-2 relative hover:border-green-400 hover:border-opacity-30 cursor-pointer transition-all duration-200 ease-in-out">
                                    <RecordDisplay
                                        attributes={attributes}
                                        record={record}
                                        onClick={() => {
                                            setSelectedRecords([...selectedRecords, record]);
                                            const newRecordList = recordList.filter((item) => item.id !== record.id);
                                            const newSimilarityRecordList = similarityRecordList.filter((item) => {
                                                if (item.id === record.id) {
                                                    setAddedSimilarityRecords(prevRecords => [...prevRecords, item]);
                                                }
                                                return item.id !== record.id;
                                            });
                                            setSimilarityRecordList(newSimilarityRecordList);
                                            setRecordList(newRecordList)
                                        }} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`h-full border-gray-300 border-l`}>
                        <div className="m-3 text-left">
                            <label>Filter by search</label>
                            <input type="text" placeholder="Search..."
                                onChange={(event: any) => { setSearch(event.target.value); }}
                                value={search}
                                className="w-full h-10 p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                            <div>Records</div>
                        </div>
                        <div style={{
                            maxHeight: 'calc(100vh - 300px)',
                            overflowY: 'scroll',
                        }} onScroll={(e: any) => refetchMoreRecords(e)}>
                            {recordList && recordList.map((record, index) => (
                                <div key={record.id} className="bg-white overflow-hidden shadow rounded-lg border m-4 p-2 relative hover:border-green-400 hover:border-opacity-30 cursor-pointer transition-all duration-200 ease-in-out">
                                    <RecordDisplay
                                        attributes={attributes}
                                        record={record}
                                        onClick={() => {
                                            setSelectedRecords([...selectedRecords, record]);
                                            const newRecordList = recordList.filter((item) => item.id !== record.id);
                                            setRecordList(newRecordList);
                                        }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </Modal>
}