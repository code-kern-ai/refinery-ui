import Modal from "@/src/components/shared/modal/Modal";
import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import ProjectsPage from "@/src/pages/projects";
import { selectVisibleAttributesDataBrowser } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createEvaluationSet, recordSearchContains } from "@/src/services/base/playground";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true };
const SEARCH_REQUEST = { offset: 0, limit: 20 };

type CreateEvaluationSetsModalProps = {
    refetchEvaluationSets: () => void;
};

export default function CreateEvaluationSetModal(props: CreateEvaluationSetsModalProps) {
    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectVisibleAttributesDataBrowser);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [question, setQuestion] = useState("");
    const [search, setSearch] = useState("");
    const [searchRequest, setSearchRequest] = useState(SEARCH_REQUEST);
    const [recordList, setRecordList] = useState<any[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

    const createEvaluationSetPost = useCallback(() => {
        createEvaluationSet(projectId, question, selectedRecords.map((record) => record.id), (res) => {
            setQuestion("");
            setSelectedRecords([]);
            props.refetchEvaluationSets();
        });
    }, [question, selectedRecords, projectId]);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createEvaluationSetPost, disabled: selectedRecords.length === 0 || question === "" });
    }, [createEvaluationSetPost, selectedRecords, question]);


    useEffect(() => {
        recordSearchContains(projectId, search, searchRequest.offset, searchRequest.limit, (res) => {
            setRecordList(res);
        });
    }, [search, searchRequest, projectId]);

    const refetchMoreRecords = useCallback((e: any) => {
        // if (e.target.offsetHeight + e.target.scrollTop >= e.target.scrollHeight) {
        //     setSearchRequest({ ...searchRequest, offset: searchRequest.offset + searchRequest.limit });
        //     recordSearchContains(projectId, search, searchRequest.offset + searchRequest.limit, searchRequest.limit, (res) => {
        //         setRecordList([...recordList, ...res]);
        //     });
        // }
    }, [recordList, searchRequest, projectId]);

    return <Modal modalName={ModalEnum.EVALUATION_SET} acceptButton={acceptButton} className="md:max-w-6xl">
        <div className="h-full">
            <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Create new evaluation set</div>
            <div className={`bg-white grid overflow-hidden min-h-full grid-cols-2`} style={{ height: 'calc(100vh - 200px)', overflowY: 'scroll' }} onScroll={(e: any) => refetchMoreRecords(e)}>
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
                    {selectedRecords && selectedRecords.map((record, index) => (<div key={record.id} className="bg-white overflow-hidden shadow rounded-lg border p-2 relative hover:border-red-400 hover:border-opacity-50 cursor-pointer transition-all duration-200 ease-in-out">
                        <RecordDisplay
                            attributes={attributes}
                            record={record}
                            onClick={() => {
                                setRecordList([...recordList, record]);
                                const newSelectedRecords = selectedRecords.filter((item) => item.id !== record.id);
                                setSelectedRecords(newSelectedRecords);
                            }} />
                    </div >))}
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
                    {recordList && recordList.map((record, index) => (<div key={record.id} className="bg-white overflow-hidden shadow rounded-lg border m-4 p-2 relative hover:border-green-400 hover:border-opacity-30 cursor-pointer transition-all duration-200 ease-in-out">
                        <RecordDisplay
                            attributes={attributes}
                            record={record}
                            onClick={() => {
                                setSelectedRecords([...selectedRecords, record]);
                                const newRecordList = recordList.filter((item) => item.id !== record.id);
                                setRecordList(newRecordList);
                            }} />
                    </div >))}
                </div>
            </div>
        </div>
    </Modal>
}