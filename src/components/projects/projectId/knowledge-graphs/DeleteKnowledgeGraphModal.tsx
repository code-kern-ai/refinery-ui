import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectKnowledgeGraphsAll } from "@/src/reduxStore/states/pages/knowledge-graphs";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { deleteKnowledgeGraphById } from "@/src/services/base/knowledge-graphs";
import { DeleteKnowledgeGraphModalProps } from "@/src/types/components/projects/projectId/knowledge-graphs/knowledge-graphs";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export default function DeleteKnowledgeGraphModal(props: DeleteKnowledgeGraphModalProps) {
    const projectId = useSelector(selectProjectId);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_KNOWLEDGE_GRAPH));
    const knowledgeGraphs = useSelector(selectKnowledgeGraphsAll);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const deleteKnowledgeGraphs = useCallback(() => {
        knowledgeGraphs.forEach((knowledgeGraph) => {
            if (knowledgeGraph.selected) {
                deleteKnowledgeGraphById(projectId, knowledgeGraph.id, (res) => {
                    props.refetch();
                })
            }
        });
    }, [modalDelete]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteKnowledgeGraphs });
    }, [modalDelete]);

    return (<Modal modalName={ModalEnum.DELETE_KNOWLEDGE_GRAPH} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
        <div className="text-sm text-gray-500 my-2 flex flex-col">
            <span>Are you sure you want to delete selected {props.countSelected <= 1 ? 'knowledge graph' : 'knowledge graphs'}?</span>
            <span>Currently selected {props.countSelected <= 1 ? 'is' : 'are'}:</span>
            <span className="whitespace-pre-line font-semibold">{props.selectionList}</span>
        </div>
    </Modal>)
}