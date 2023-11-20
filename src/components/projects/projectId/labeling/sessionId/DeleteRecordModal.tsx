import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { DELETE_RECORD_BY_RECORD_ID } from "@/src/services/gql/mutations/labeling";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };

export default function DeleteRecordModal() {
    const projectId = useSelector(selectProjectId);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_RECORD));

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const [deleteRecordMut] = useMutation(DELETE_RECORD_BY_RECORD_ID);

    const deleteRecord = useCallback(() => {
        deleteRecordMut({ variables: { projectId: projectId, recordId: modalDelete.recordId } }).then(() => { });
    }, [modalDelete.recordId]);

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