import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectHeuristicsAll } from "@/src/reduxStore/states/pages/heuristics";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteHeuristicById } from "@/src/services/base/heuristic";
import { DeleteHeuristicsModalProps } from "@/src/types/components/projects/projectId/heuristics/heuristics";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export default function DeleteHeuristicsModal(props: DeleteHeuristicsModalProps) {
    const projectId = useSelector(selectProjectId);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_HEURISTICS));
    const heuristics = useSelector(selectHeuristicsAll);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const deleteHeuristics = useCallback(() => {
        heuristics.forEach((heuristic) => {
            if (heuristic.selected) {
                deleteHeuristicById(projectId, heuristic.id, (res) => {
                    props.refetch();
                })
            }
        });
    }, [modalDelete]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteHeuristics });
    }, [modalDelete]);

    return (<Modal modalName={ModalEnum.DELETE_HEURISTICS} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
        <div className="text-sm text-gray-500 my-2 flex flex-col">
            <span>Are you sure you want to delete selected {props.countSelected <= 1 ? 'heuristic' : 'heuristics'}?</span>
            <span>Currently selected {props.countSelected <= 1 ? 'is' : 'are'}:</span>
            <span className="whitespace-pre-line font-semibold">{props.selectionList}</span>
        </div>
    </Modal>)
}