import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectUsableNonTextAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { UPDATE_EMBEDDING_PAYLOAD } from "@/src/services/gql/mutations/project-settings";
import { FilterAttributesModalProps } from "@/src/types/components/projects/projectId/settings/embeddings";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const EDIT_BUTTON = { buttonCaption: 'Edit', useButton: true, disabled: false, closeAfterClick: false };
const ACCEPT_BUTTON = { buttonCaption: 'Save', useButton: false, disabled: false, closeAfterClick: false };

export default function FilterAttributesModal(props: FilterAttributesModalProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalFilteredAttributes = useSelector(selectModal(ModalEnum.FILTERED_ATTRIBUTES));
    const usableAttributes = useSelector(selectUsableNonTextAttributes);

    const [checkedAttributes, setCheckedAttributes] = useState([]);

    const [editButton, setEditButton] = useState<ModalButton>(EDIT_BUTTON);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const [updateEmbeddingPayloadMut] = useMutation(UPDATE_EMBEDDING_PAYLOAD);

    const saveFilteredAttributes = useCallback(() => {
        props.setShowEditOption(false);
        dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { showEditOption: false }));
        updateEmbeddingPayloadMut({ variables: { projectId: projectId, embeddingId: modalFilteredAttributes.embeddingId, filterAttributes: JSON.stringify(props.filterAttributesUpdate) } }).then((res) => { });
    }, [props.filterAttributesUpdate]);

    const editFilteredAttributes = useCallback(() => {
        props.setShowEditOption(true);
        dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { showEditOption: true }));
    }, [modalFilteredAttributes]);

    useEffect(() => {
        const editButtonCopy = { ...editButton };
        editButtonCopy.emitFunction = editFilteredAttributes;
        setEditButton(editButtonCopy);
    }, [modalFilteredAttributes]);

    useEffect(() => {
        const editButtonCopy = { ...editButton }
        editButtonCopy.useButton = !props.showEditOption;
        setEditButton(editButtonCopy);
        const acceptButtonCopy = { ...acceptButton };
        acceptButtonCopy.useButton = props.showEditOption;
        acceptButtonCopy.emitFunction = saveFilteredAttributes;
        setAcceptButton(acceptButtonCopy);
    }, [props.showEditOption]);

    useEffect(() => {
        if (!usableAttributes) return;
        if (!modalFilteredAttributes.attributeNames) return;
        const updated = usableAttributes.map((attribute) => {
            const attributeCopy = { ...attribute };
            attributeCopy.checked = modalFilteredAttributes.attributeNames.find((a) => a.name == attribute.name) != undefined;
            return attributeCopy;
        });
        setCheckedAttributes(updated);
    }, [usableAttributes, modalFilteredAttributes]);

    return (<Modal modalName={ModalEnum.FILTERED_ATTRIBUTES} acceptButton={acceptButton} backButton={editButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Edit embedding with filter attributes</div>
        <div className="my-2 flex flex-grow justify-center text-sm text-gray-500 text-center">
            List of filter attributes selected when creating an embedding</div>
        {modalFilteredAttributes.attributeNames && modalFilteredAttributes.attributeNames.length == 0 ? <div className="text-xs text-gray-500 text-center italic">No filter attributes selected</div> : <div className="flex justify-center items-center">
            {modalFilteredAttributes.attributeNames.map((attribute) => (
                <Tooltip content={attribute.dataType} color="invert" placement="top" key={attribute.id} className="cursor-auto">
                    <span className={`border items-center px-2 py-0.5 rounded text-xs font-medium text-center mr-2 bg-${attribute.color}-100 text-${attribute.color}-700 border-${attribute.color}-400 hover:bg-${attribute.color}-200`}>{attribute.name}</span>
                </Tooltip>
            ))}
        </div>}
        {modalFilteredAttributes.showEditOption && <div className="mt-3">
            <div className="text-xs text-gray-500 text-center italic">Add or remove filter attributes</div>
            <Dropdown options={usableAttributes.map(a => a.name)} buttonName={props.filterAttributesUpdate.length == 0 ? 'None selected' : props.filterAttributesUpdate.join(',')} hasCheckboxes={true}
                selectedCheckboxes={checkedAttributes.map(a => a.checked)} hasSelectAll={true}
                selectedOption={(option: any) => {
                    const attributes = option.filter((o: any) => o.checked).map((o: any) => o.name);
                    props.setFilterAttributesUpdate(attributes);
                }} />
        </div>}
    </Modal>
    )
}