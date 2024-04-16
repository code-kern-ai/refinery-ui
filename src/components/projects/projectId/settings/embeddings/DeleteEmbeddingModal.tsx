import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { removeFromAllEmbeddingsById } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteEmbeddingPost, deleteFromTaskQueue } from "@/src/services/base/embedding";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { useButton: true, disabled: false };

export default function DeleteEmbeddingModal() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalDeleteEmbedding = useSelector(selectModal(ModalEnum.DELETE_EMBEDDING));

    const deleteEmbedding = useCallback(() => {
        const embeddingId = modalDeleteEmbedding.embeddingId;
        if (!embeddingId) return;
        if (modalDeleteEmbedding.isQueuedElement) {
            deleteFromTaskQueue(projectId, embeddingId, (res) => {
                dispatch(removeFromAllEmbeddingsById(embeddingId));
            });
        } else {
            deleteEmbeddingPost(projectId, embeddingId, (res) => {
                dispatch(removeFromAllEmbeddingsById(embeddingId));
            });
        }
    }, [modalDeleteEmbedding]);

    useEffect(() => {
        const abortButtonCopy = { ...abortButton };
        abortButtonCopy.buttonCaption = modalDeleteEmbedding.isQueuedElement ? 'Dequeue embedding' : 'Delete embedding';
        abortButtonCopy.emitFunction = deleteEmbedding;
        setAbortButton(abortButtonCopy);
    }, [modalDeleteEmbedding]);


    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);


    return (<Modal modalName={ModalEnum.DELETE_EMBEDDING} abortButton={abortButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Warning </div>
        <p className="mt-2 text-gray-500 text-sm">Are you sure you want to {modalDeleteEmbedding.isQueuedElement ? 'dequeue' : 'delete'} this embedding?</p>
        {!modalDeleteEmbedding.isQueuedElement && <p className="mt-2 text-gray-500 text-sm">This will delete all corresponding tensors!</p>}

    </Modal>)
}