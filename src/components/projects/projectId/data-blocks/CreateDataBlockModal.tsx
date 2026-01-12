import Modal from "@/src/components/shared/modal/Modal";
import { selectDataBlocksAll } from "@/src/reduxStore/states/pages/data-blocks";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createDataBlock } from "@/src/services/base/data-blocks";
import { DataBlockType } from "@/src/types/components/projects/projectId/data-blocks/data-blocks";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Create', useButton: true, disabled: true };
const TYPE_OPTIONS = Object.values(DataBlockType)

export default function CreateDataBlockModal() {
    const router = useRouter();

    const projectId = useSelector(selectProjectId);
    const dataBlocks = useSelector(selectDataBlocksAll);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState(null);

    const createDataBlockPost = useCallback(() => {
        createDataBlock(projectId, name, description, type, (res) => {
            router.push(`/projects/${projectId}/data-blocks/${res.id}?type=${type}`);
        });
    }, [name, description, type]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: createDataBlockPost, disabled: !name || !type });
    }, [name, type, createDataBlockPost]);

    return (<Modal modalName={ModalEnum.CREATE_DATA_BLOCK} acceptButton={acceptButton}>
        <h1 className="text-lg text-gray-900 text-center mb-4">Add new data block</h1>
        <div className="grid grid-cols-2 gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <div className="justify-self-start">
                <span className="card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Name</span></span>
            </div>
            <input placeholder="Enter name..." value={name} onChange={(e: any) => setName(e.target.value)}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />

            <div className="justify-self-start">
                <span className="card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Description</span></span>
            </div>
            <input placeholder="Enter description..." value={description} onChange={(e: any) => setDescription(e.target.value)}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />

            <div className="justify-self-start">
                <span className="card-title mb-0 label-text text-left"><span className="underline filtersUnderline">Type</span></span>
            </div>
            <KernDropdown options={TYPE_OPTIONS} buttonName={type ?? 'Select type'} selectedOption={setType} />
        </div>
    </Modal>
    )
}