import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { removeFromAllLookupListById, selectAllLookupLists, selectCheckedLookupLists } from "@/src/reduxStore/states/pages/lookup-lists";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { DELETE_LOOKUP_LIST } from "@/src/services/gql/mutations/lookup-lists";
import { DeleteLookupListsModalProps } from "@/src/types/components/projects/projectId/lookup-lists";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: "Delete", useButton: true, disabled: false };

export default function DeleteLookupListsModal(props: DeleteLookupListsModalProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalDelete = useSelector(selectModal(ModalEnum.DELETE_LOOKUP_LIST));
    const lookupLists = useSelector(selectAllLookupLists);
    const checkedLookupLists = useSelector(selectCheckedLookupLists);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    const [deleteLookupListMut] = useMutation(DELETE_LOOKUP_LIST);


    const deleteLookupLists = useCallback(() => {
        checkedLookupLists.forEach((checked, index) => {
            if (checked) {
                const lookupList = lookupLists[index];
                deleteLookupListMut({
                    variables: {
                        projectId: projectId,
                        knowledgeBaseId: lookupList.id
                    }
                }).then((res) => {
                    dispatch(removeFromAllLookupListById(lookupList.id));
                });
            }
        });
    }, [checkedLookupLists]);

    useEffect(() => {
        setAbortButton({ ...ABORT_BUTTON, emitFunction: deleteLookupLists });
    }, [modalDelete]);

    return (<Modal modalName={ModalEnum.DELETE_LOOKUP_LIST} abortButton={abortButton}>
        <h1 className="text-lg text-gray-900 mb-2">Warning</h1>
        <div className="text-sm text-gray-500 my-2 flex flex-col">
            <span>Are you sure you want to delete selected lookup {props.countSelected <= 1 ? 'list' : 'lists'}?</span>
            <span>Currently selected {props.countSelected <= 1 ? 'is' : 'are'}:</span>
            <span className="whitespace-pre-line font-bold">{props.selectionList}</span>
        </div>
    </Modal>)
}