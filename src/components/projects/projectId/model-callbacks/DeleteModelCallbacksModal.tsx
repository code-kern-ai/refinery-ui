import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { DELETE_HEURISTIC } from "@/src/services/gql/mutations/heuristics";
import { DeleteModelCallBacksModalProps } from "@/src/types/components/projects/projectId/model-callbacks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export default function DeleteModelCallBacksModal(props: DeleteModelCallBacksModalProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId)
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_MODEL_CALLBACKS));

    const [deleteHeuristicMut] = useMutation(DELETE_HEURISTIC);

    const deleteModelCallbacks = useCallback(() => {
        props.checkedModelCallbacks.forEach((checked, index) => {
            if (checked) {
                const modelCallBack = props.modelCallBacks[index];
                deleteHeuristicMut({
                    variables: {
                        projectId: projectId,
                        knowledgeBaseId: modelCallBack.id
                    }
                }).then((res) => {
                    props.removeModelCallBack(modelCallBack.id)
                });
            }
        });
    }, [modalDelete, props.checkedModelCallbacks]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteModelCallbacks });
    }, [modalDelete]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    return (<Modal modalName={ModalEnum.DELETE_MODEL_CALLBACKS} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
        <div className="text-sm text-gray-500 my-2 flex flex-col">
            <span>Are you sure you want to delete selected model {props.countSelected <= 1 ? 'callback' : 'callbacks'}?</span>
            <span>Currently selected {props.countSelected <= 1 ? 'is' : 'are'}:</span>
            <span className="whitespace-pre-line font-bold">{props.selectionList}</span>
        </div>
    </Modal>)
}