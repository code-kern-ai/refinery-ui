import { RecordDisplay } from "@/src/components/shared/record-display/RecordDisplay";
import RecordTable from "@/src/components/shared/record-table/RecordTable";
import { selectUser } from "@/src/reduxStore/states/general";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { selectConfiguration, selectRecords } from "@/src/reduxStore/states/pages/data-browser";
import { RecordListProps } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { ModalEnum } from "@/src/types/shared/modal";
import { UserRole } from "@/src/types/shared/sidebar";
import { DATA_BROWSER_TABLE_COLUMN_HEADERS } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconEdit, IconNotes } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";

export default function RecordList(props: RecordListProps) {
    const dispatch = useDispatch();

    const recordList = useSelector(selectRecords).recordList;
    const user = useSelector(selectUser);
    const configuration = useSelector(selectConfiguration);

    return (<>
        {recordList && recordList.map((record, index) => (<div key={index} className="bg-white overflow-hidden shadow rounded-lg border mb-4 pb-4 relative">
            <div className="px-4 py-5 sm:p-6">
                {props.recordComments[record.id] && <div className="cursor-pointer absolute top-6 right-5" onClick={() => dispatch(setModalStates(ModalEnum.RECORD_COMMENTS, { commentsData: props.recordComments[record.id], open: true }))}>
                    <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.RECORD_COMMENTS} color="invert" placement="left">
                        <IconNotes className="h-4 w-4" />
                    </Tooltip>
                </div>}

                <RecordDisplay />
                {record.rla_aggregation && <div className="mt-2 flex flex-col">
                    {record.wsHint && configuration.weakSupervisionRelated && <div className="text-gray-800 text-sm font-semibold">{record.wsHint}</div>}
                    <RecordTable columnsData={DATA_BROWSER_TABLE_COLUMN_HEADERS} tableData={record.rla_aggregation} />
                </div>}
            </div>
            {user?.role == UserRole.ENGINEER && <div className="p-2 cursor-pointer absolute right-2 top-2">
                <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.EDIT_RECORD} color="invert">
                    <IconEdit className="h-4 w-4" onClick={() => props.editRecord(index)} />
                </Tooltip></div>}
        </div >))
        }
    </>);
}