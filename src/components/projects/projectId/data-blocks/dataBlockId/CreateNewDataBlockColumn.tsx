import Modal from "@/src/components/shared/modal/Modal"
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createAttribute } from "@/src/services/base/project-setting";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal"
import { DATA_TYPES, findFreeAttributeName } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: "Accept", useButton: true, disabled: true }

export default function CreateNewDataBlockColumn() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalNewDataBlockColumn = useSelector(selectModal(ModalEnum.CREATE_DATA_BLOCK_COLUMN));
    // const dataBlockColumns = useSelector(selectAttributes);

    const [dataBlockColumnName, setDataBlockColumnName] = useState('');
    const [dataBlockColumnType, setDataBlockColumnType] = useState(DATA_TYPES[0]);
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);

    const createDataBlockColumn = useCallback(() => {

    }, [dataBlockColumnName, dataBlockColumnType]);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createDataBlockColumn, disabled: duplicateNameExists || dataBlockColumnName.trim() == "" || dataBlockColumnType == null });
    }, [modalNewDataBlockColumn, dataBlockColumnName, dataBlockColumnType, duplicateNameExists]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function handleAttributeName(value: string) {
        // const checkName = attributes.some(attribute => attribute.name == valueToSave);
        // setAttributeName(valueToSave);
        // setDuplicateNameExists(checkName);
    }

    return (<Modal modalName={ModalEnum.CREATE_DATA_BLOCK_COLUMN} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Add new data block column </div>
        <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
            Choose a name for your data block column</div>
        <div className="grid grid-cols-2  gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <span className="card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Data block column name</span></span>

            <input type="text" value={dataBlockColumnName} onChange={(e: any) => setDataBlockColumnName(e.target.value)}
                onKeyDown={(e) => { if (e.key == 'Enter') createDataBlockColumn() }}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter a data block column name..." />

            <span className="card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Data block column type</span></span>
            {/* <KernDropdown buttonName={attributeType ? attributeType.name : 'Select type'} options={filteredDataTypes} selectedOption={(option: any) => setAttributeType(option)} /> */}
        </div>
        {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Data block column name exists</div>}
    </Modal>)
}