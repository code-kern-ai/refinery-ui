import { DangerZoneEnum, DangerZoneProps } from "@/src/types/shared/danger-zone";
import Modal from "../modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useCallback, useEffect, useState } from "react";
import { selectModal } from "@/src/reduxStore/states/modal";
import { useDispatch, useSelector } from "react-redux";
import { removeFromAllAttributesById } from "@/src/reduxStore/states/pages/settings";
import LoadingIcon from "../loading/LoadingIcon";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { removeFromAllLookupListById } from "@/src/reduxStore/states/pages/lookup-lists";
import { useRouter } from "next/router";
import { deleteHeuristicById } from "@/src/services/base/heuristic";
import { deleteKnowledgeBase } from "@/src/services/base/lookup-lists";
import { deleteUserAttribute } from "@/src/services/base/attribute";

const ABORT_BUTTON = { buttonCaption: 'Delete', disabled: false, useButton: true };

export default function DeleteElementModal(props: DangerZoneProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_ELEMENT));

    const [isDeleting, setIsDeleting] = useState(false);

    const deleteElement = useCallback(() => {
        setIsDeleting(true);
        switch (props.elementType) {
            case DangerZoneEnum.ATTRIBUTE:
                deleteUserAttribute(projectId, { attributeId: props.id }, (res) => {
                    setIsDeleting(false);
                    dispatch(removeFromAllAttributesById(props.id));
                    router.push(`/projects/${projectId}/settings`);
                });
                break;
            case DangerZoneEnum.LOOKUP_LIST:
                deleteKnowledgeBase(projectId, props.id, (res) => {
                    setIsDeleting(false);
                    dispatch(removeFromAllLookupListById(props.id));
                });
                router.push(`/projects/${projectId}/lookup-lists`);
                break;
            case DangerZoneEnum.LABELING_FUNCTION:
            case DangerZoneEnum.ACTIVE_LEARNING:
                deleteHeuristicById(projectId, props.id, (res) => {
                    setIsDeleting(false);
                });
                router.push(`/projects/${projectId}/heuristics`);
                break;
        }

    }, [modalDelete]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: deleteElement });
    }, [modalDelete]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    return (<Modal modalName={ModalEnum.DELETE_ELEMENT} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
        <div className="text-sm text-gray-500 my-2">
            Are you sure you want to delete this {props.elementType}?
            <p>This will delete all data associated with it, including labeling tasks.</p>
            {isDeleting && <LoadingIcon color="red" />}
        </div>
    </Modal>)
}