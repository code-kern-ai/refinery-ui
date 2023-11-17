import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { removeFromAllDataSlicesById } from "@/src/reduxStore/states/pages/data-browser";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { DELETE_DATA_SLICE } from "@/src/services/gql/mutations/data-browser";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };

export default function DeleteSliceModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);

    const modalDeleteSlice = useSelector(selectModal(ModalEnum.DELETE_SLICE));

    const [deleteDataSliceMut] = useMutation(DELETE_DATA_SLICE);

    const deleteDataSlice = useCallback(() => {
        deleteDataSliceMut({ variables: { projectId: projectId, dataSliceId: modalDeleteSlice.sliceId } }).then((res) => {
            dispatch(removeFromAllDataSlicesById(modalDeleteSlice.sliceId));
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