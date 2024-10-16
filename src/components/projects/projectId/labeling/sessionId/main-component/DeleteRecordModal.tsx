import Modal from "@/src/components/shared/modal/Modal";
import { selectRecordRequestsRecord, updateRecordRequests } from "@/src/reduxStore/states/pages/labeling";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteRecordById } from "@/src/services/base/labeling";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { SessionManager } from "@/src/util/classes/labeling/session-manager";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };

export default function DeleteRecordModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const record = useSelector(selectRecordRequestsRecord);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const deleteRecord = useCallback(() => {
        const recordId = record.id;
        deleteRecordById(projectId, recordId, (r) => {
            if (r['data']['deleteRecord']) {
                SessionManager.setCurrentRecordDeleted();
                dispatch(updateRecordRequests('record', null));
                LabelingSuiteManager.somethingLoading = false;
            } else {
                console.log("Something went wrong with deletion of record:" + recordId);
            }
        });
    }, [record]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteRecord });
    }, [deleteRecord]);

    return (<Modal modalName={ModalEnum.DELETE_RECORD} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2 text-center">Warning</h1>
        <div className="text-sm text-gray-500 my-2 text-center">
            Are you sure you want to delete this record?
        </div>
    </Modal>)
}