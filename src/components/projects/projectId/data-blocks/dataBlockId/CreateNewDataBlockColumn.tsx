import Modal from "@/src/components/shared/modal/Modal"
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal"
import { DATA_TYPES } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DATA_BLOCK_COLUMN_TYPES } from "@/src/util/components/projects/projectId/data-blocks/data-blocks";
import { selectDataBlock, selectDataBlockColumns } from "@/src/reduxStore/states/pages/data-blocks";
import { createDataBlockColumn } from "@/src/services/base/data-blocks";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";

const ACCEPT_BUTTON = { buttonCaption: "Accept", useButton: true, disabled: true }

export default function CreateNewDataBlockColumn() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalNewDataBlockColumn = useSelector(selectModal(ModalEnum.CREATE_DATA_BLOCK_COLUMN));
    const dataBlockColumns = useSelector(selectDataBlockColumns);
    const dataBlockId = useSelector(selectDataBlock).id;

    const [dataBlockColumnName, setDataBlockColumnName] = useState('');
    const [dataBlockColumnType, setDataBlockColumnType] = useState(DATA_TYPES[0]);
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);
    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const createDataBlockColumnFunc = useCallback(() => {
        createDataBlockColumn(projectId, dataBlockId, dataBlockColumnName, dataBlockColumnType.value, (res) => {
            if (res?.id) {
                dispatch(setCurrentPage(CurrentPage.DATA_BLOCKS_COLUMNS));
                router.push(`/projects/${projectId}/data-blocks/${dataBlockId}/${res.id}`);
            }
        });
    }, [projectId, dataBlockColumnName, dataBlockColumnType, dataBlockId]);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createDataBlockColumnFunc, disabled: duplicateNameExists || dataBlockColumnName.trim() == "" || dataBlockColumnType == null });
    }, [modalNewDataBlockColumn, dataBlockColumnName, dataBlockColumnType, duplicateNameExists]);


    const handleDataBlockColumnName = useCallback((value: string) => {
        const valueToSave = toPythonFunctionName(value);
        const checkName = dataBlockColumns.some(column => column.name == valueToSave);
        setDataBlockColumnName(valueToSave);
        setDuplicateNameExists(checkName);
    }, [dataBlockColumns]);

    return (<Modal modalName={ModalEnum.CREATE_DATA_BLOCK_COLUMN} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Add new data block column </div>
        <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
            Choose a name for your data block column</div>
        <div className="grid grid-cols-2  gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <span className="card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Data block column name</span></span>

            <input type="text" value={dataBlockColumnName} onChange={(e: any) => handleDataBlockColumnName(e.target.value)}
                onKeyDown={(e) => { if (e.key == 'Enter') createDataBlockColumnFunc() }}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter a data block column name..." />

            <span className="card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Data block column type</span></span>
            <KernDropdown buttonName={dataBlockColumnType ? dataBlockColumnType.name : 'Select type'} options={DATA_BLOCK_COLUMN_TYPES} selectedOption={setDataBlockColumnType} />
        </div>
        {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Data block column name exists</div>}
    </Modal>)
}