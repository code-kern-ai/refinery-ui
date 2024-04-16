import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { removeFromAllDataSlicesById, setActiveDataSlice, setActiveSearchParams, setIsTextHighlightNeeded, setRecordsInDisplay, setTextHighlight, updateAdditionalDataState } from "@/src/reduxStore/states/pages/data-browser";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteDataSliceById } from "@/src/services/base/dataSlices";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };

export default function DeleteSliceModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);

    const modalDeleteSlice = useSelector(selectModal(ModalEnum.DELETE_SLICE));

    const deleteDataSlice = useCallback(() => {
        deleteDataSliceById(projectId, modalDeleteSlice.sliceId, (res) => {
            dispatch(removeFromAllDataSlicesById(modalDeleteSlice.sliceId));
            dispatch(updateAdditionalDataState('clearFullSearch', true));
            dispatch(setActiveSearchParams([]));
            dispatch(setRecordsInDisplay(false));
            dispatch(setActiveDataSlice(null));
            dispatch(setTextHighlight([]));
            dispatch(setIsTextHighlightNeeded({}));
        });
    }, [modalDeleteSlice.sliceId]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: deleteDataSlice });
    }, [deleteDataSlice]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    return (<Modal modalName={ModalEnum.DELETE_SLICE} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2 text-center">Warning</h1>
        <div className="text-sm text-gray-500 my-2 text-center">
            Are you sure you want to delete this data slice?
        </div>
    </Modal>)
}