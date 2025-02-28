import Modal from "@/src/components/shared/modal/Modal";
import { closeModal, selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectUsableNonTextAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { updateEmbeddingPayload } from "@/src/services/base/embedding";
import { FilterAttributesModalProps } from "@/src/types/components/projects/projectId/settings/embeddings";
import { ModalEnum } from "@/src/types/shared/modal";
import KernButton from "@/submodules/react-components/components/kern-button/KernButton";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function FilterAttributesModal(props: FilterAttributesModalProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalFilteredAttributes = useSelector(selectModal(ModalEnum.FILTERED_ATTRIBUTES));
    const usableAttributes = useSelector(selectUsableNonTextAttributes);

    const [checkedAttributes, setCheckedAttributes] = useState([]);

    function editFilteredAttributes() {
        props.setShowEditOption(true);
        dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { showEditOption: true }));
    }

    function saveFilteredAttributes() {
        props.setShowEditOption(false);
        dispatch(closeModal(ModalEnum.FILTERED_ATTRIBUTES));
        dispatch(setModalStates(ModalEnum.FILTERED_ATTRIBUTES, { showEditOption: false }));
        updateEmbeddingPayload(projectId, { embeddingId: modalFilteredAttributes.embeddingId, filterAttributes: props.filterAttributesUpdate }, (res) => { });
    }

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

    return (<Modal modalName={ModalEnum.FILTERED_ATTRIBUTES} hasOwnButtons={true}>
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
            <KernDropdown options={usableAttributes} buttonName={props.filterAttributesUpdate.length == 0 ? 'None selected' : props.filterAttributesUpdate.join(', ')} hasCheckboxes={true}
                selectedCheckboxes={checkedAttributes.map(a => a.checked)} hasSelectAll={true}
                selectedOption={(option: any) => {
                    const attributes = option.filter((o: any) => o.checked).map((o: any) => o.name);
                    props.setFilterAttributesUpdate(attributes);
                }} />
        </div>}
        <div className="flex mt-6 justify-end gap-x-2">
            {!props.showEditOption && <KernButton
                text="Edit"
                onClick={editFilteredAttributes}
            />}
            {props.showEditOption && <KernButton
                text="Save"
                onClick={saveFilteredAttributes}
                buttonColor="green"
            />}
            <KernButton
                text="Close"
                onClick={() => dispatch(closeModal(ModalEnum.FILTERED_ATTRIBUTES))}
            />
        </div>
    </Modal >
    )
}