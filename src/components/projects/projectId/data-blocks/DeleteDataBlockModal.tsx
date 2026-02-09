import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectDataBlocksAll } from "@/src/reduxStore/states/pages/data-blocks";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteDataBlockByIds } from "@/src/services/base/data-blocks";
import { DeleteDataBlockModalProps } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export default function DeleteDataBlockModal(props: DeleteDataBlockModalProps) {
    const projectId = useSelector(selectProjectId);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_DATA_BLOCK));
    const dataBlocks = useSelector(selectDataBlocksAll);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const deleteDataBlocks = useCallback(() => {
        const dataBlockIds = dataBlocks.filter((dataBlock) => dataBlock.selected).map((dataBlock) => dataBlock.id);
        deleteDataBlockByIds(projectId, dataBlockIds, (res) => {
            props.refetch();
        });
    }, [modalDelete]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteDataBlocks });
    }, [modalDelete]);

    return (<Modal modalName={ModalEnum.DELETE_DATA_BLOCK} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
        <div className="text-sm text-gray-500 my-2 flex flex-col">
            <span>Are you sure you want to delete selected {props.countSelected <= 1 ? 'data block' : 'data blocks'}?</span>
            <span>Currently selected {props.countSelected <= 1 ? 'is' : 'are'}:</span>
            <span className="whitespace-pre-line font-semibold">{props.selectionList}</span>
        </div>
    </Modal>)
}