import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import RecordTable from "@/src/components/shared/record-table/RecordTable";
import { selectUser } from "@/src/reduxStore/states/general";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { selectConfiguration, selectRecordComments, selectRecords } from "@/src/reduxStore/states/pages/data-browser";
import { selectEmbeddings } from "@/src/reduxStore/states/pages/settings";
import { RecordListProps } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ModalEnum } from "@/src/types/shared/modal";
import { UserRole } from "@/src/types/shared/sidebar";
import { DATA_BROWSER_TABLE_COLUMN_HEADERS } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconAngle, IconArrowRight, IconEdit, IconNotes } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import SimilaritySearchModal from "./modals/SimilaritySeachModal";
import RecordCommentsModal from "./modals/RecordCommentsModal";

export default function RecordList(props: RecordListProps) {
    const dispatch = useDispatch();

    const recordList = useSelector(selectRecords).recordList;
    const user = useSelector(selectUser);
    const configuration = useSelector(selectConfiguration);
    const embeddings = useSelector(selectEmbeddings);
    const recordComments = useSelector(selectRecordComments);

    return (<>
        {recordList && recordList.map((record, index) => (<div key={index} className="bg-white overflow-hidden shadow rounded-lg border mb-4 pb-4 relative">
            <div className="px-4 py-5 sm:p-6">
                {recordComments[record.id] && <div className="cursor-pointer absolute top-10 right-4"
                    onClick={() => dispatch(setModalStates(ModalEnum.RECORD_COMMENTS, { commentsData: recordComments[record.id], open: true }))}>
                    <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.RECORD_COMMENTS} color="invert" placement="left" className="cursor-auto">
                        <IconNotes className="h-4 w-4" />
                    </Tooltip>
                </div>}

                <RecordDisplay record={record} />
                {record.rla_aggregation && <div className="mt-2 flex flex-col">
                    {record.wsHint && configuration.weakSupervisionRelated && <div className="text-gray-800 text-sm font-semibold">{record.wsHint}</div>}
                    <RecordTable columnsData={DATA_BROWSER_TABLE_COLUMN_HEADERS} tableData={record.rla_aggregation} />
                </div>}

                <div className="mt-3">
                    <div className="float-left">
                        {embeddings.length == 0 ? (<Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.ADD_EMBEDDING} color="invert" placement="right" className="cursor-auto">
                            <label className="text-gray-700 text-sm font-medium">
                                <span className="cursor-help leading-5 underline filtersUnderline">No embedding, can&apos;t find similar records</span>
                            </label>
                        </Tooltip>) : (<button className="text-green-700 hover:text-green-500 text-sm font-medium cursor-pointer"
                            onClick={() => dispatch(setModalStates(ModalEnum.SIMILARITY_SEARCH, { recordId: record.id, open: true }))}>
                            <span className="leading-5">Find similar records
                                <IconAngle className="h-4 w-4 inline-block" />
                            </span>
                        </button>)}
                    </div>
                    <div className="float-right">
                        <button className="text-green-700 hover:text-green-500 text-sm font-medium cursor-pointer" onClick={() => props.recordClicked(index)}>
                            <span className="leading-5">Continue with this record
                                <IconArrowRight className="h-4 w-4 inline-block" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            {user?.role == UserRole.ENGINEER && <div className="p-2 cursor-pointer absolute right-2 top-2">
                <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.EDIT_RECORD} color="invert">
                    <IconEdit className="h-4 w-4" onClick={() => props.editRecord(index)} />
                </Tooltip></div>}
        </div >))
        }
        <SimilaritySearchModal />
        <RecordCommentsModal />
    </>);
}