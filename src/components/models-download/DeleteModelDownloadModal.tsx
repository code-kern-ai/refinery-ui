import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import Modal from "../shared/modal/Modal";
import { useCallback, useEffect, useState } from "react";
import { removeModelDownloadByName } from "@/src/reduxStore/states/pages/models-downloaded";
import { useMutation } from "@apollo/client";
import { MODEL_PROVIDER_DELETE_MODEL } from "@/src/services/gql/mutations/projects";
import { useDispatch, useSelector } from "react-redux";
import { selectModal } from "@/src/reduxStore/states/modal";

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };

export default function DeleteModelDownloadModal() {
    const dispatch = useDispatch();

    const modalDeleteModel = useSelector(selectModal(ModalEnum.DELETE_MODEL_DOWNLOAD));

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const [deleteModelDownload] = useMutation(MODEL_PROVIDER_DELETE_MODEL);

    const deleteModel = useCallback(() => {
        deleteModelDownload({ variables: { modelName: modalDeleteModel.modelName } }).then(() => {
            dispatch(removeModelDownloadByName(modalDeleteModel.modelName));
        });
    }, [modalDeleteModel.modelName]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: deleteModel });
    }, [deleteModel]);

    return (<Modal modalName={ModalEnum.DELETE_MODEL_DOWNLOAD} abortButton={abortButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Warning </div>
        <p className="mt-2 text-gray-500 text-sm">Are you sure you want to delete this model?</p>
        <p className="text-gray-500 text-sm">This will delete all data associated with it!</p>
    </Modal>)
}