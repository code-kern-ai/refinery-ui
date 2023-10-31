import { DangerZoneEnum, DangerZoneProps } from "@/src/types/shared/danger-zone";
import { Tooltip } from "@nextui-org/react";
import Modal from "../modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { use, useCallback, useEffect, useState } from "react";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@apollo/client";
import { DELETE_USER_ATTRIBUTE } from "@/src/services/gql/mutations/projects";
import { removeFromAllAttributesById } from "@/src/reduxStore/states/pages/settings";
import { useRouter } from "next/router";
import LoadingIcon from "../loading/LoadingIcon";
import { selectProject } from "@/src/reduxStore/states/project";
import { DELETE_LOOKUP_LIST } from "@/src/services/gql/mutations/lookup-lists";
import { removeFromAllLookupListById } from "@/src/reduxStore/states/pages/lookup-lists";
import { DELETE_HEURISTIC } from "@/src/services/gql/mutations/heuristics";

const ABORT_BUTTON = { buttonCaption: 'Delete', disabled: false, useButton: true };

export default function DangerZone(props: DangerZoneProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_ELEMENT));

    const [isDeleting, setIsDeleting] = useState(false);

    const [deleteAttributeMut] = useMutation(DELETE_USER_ATTRIBUTE)
    const [deleteLookupListMut] = useMutation(DELETE_LOOKUP_LIST);
    const [deleteHeuristicMut] = useMutation(DELETE_HEURISTIC);

    const deleteElement = useCallback(() => {
        setIsDeleting(true);
        switch (props.elementType) {
            case DangerZoneEnum.ATTRIBUTE:
                deleteAttributeMut({ variables: { projectId: project.id, attributeId: props.id } }).then(() => {
                    setIsDeleting(false);
                    dispatch(removeFromAllAttributesById(props.id));
                    router.push(`/projects/${project.id}/settings`);
                });
            case DangerZoneEnum.LOOKUP_LIST:
                deleteLookupListMut({ variables: { projectId: project.id, knowledgeBaseId: props.id } }).then(() => {
                    setIsDeleting(false);
                    dispatch(removeFromAllLookupListById(props.id));
                    router.push(`/projects/${project.id}/lookup-lists`);
                });
            case DangerZoneEnum.LABELING_FUNCTION:
            case DangerZoneEnum.ACTIVE_LEARNING:
                deleteHeuristicMut({ variables: { projectId: project.id, informationSourceId: props.id } }).then(() => {
                    setIsDeleting(false);
                    router.push(`/projects/${project.id}/heuristics`);
                });
        }

    }, [modalDelete]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: deleteElement });
    }, [modalDelete]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    return (<div className="mt-8 pb-4">
        <div className="text-gray-900 text-lg leading-6 font-medium">Danger zone</div>

        <div className="flex flex-row items-center">
            <div className="text-sm leading-5 font-normal mt-2 text-gray-500 inline-block">This action can not be reversed.
                Are you sure you want to delete this {props.elementType}?</div>

            <Tooltip content="This can't be reverted!" placement="right" color="invert">
                <button onClick={() => dispatch(setModalStates(ModalEnum.DELETE_ELEMENT, { open: true, id: props.id }))}
                    className="bg-red-100 text-red-700 border border-red-400 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer ml-6 h-9 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Delete {props.name}
                </button>
            </Tooltip>
        </div>
        <Modal modalName={ModalEnum.DELETE_ELEMENT} abortButton={abortButton}>
            <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
            <div className="text-sm text-gray-500 my-2">
                Are you sure you want to delete this attribute?
                <p>This will delete all data associated with it, including labeling tasks.</p>
                {isDeleting && <LoadingIcon color="red" />}
            </div>
        </Modal>
    </div >)
}