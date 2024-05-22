import Modal from "@/src/components/shared/modal/Modal"
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { createAttribute } from "@/src/services/base/project-setting";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/web-sockets-helper";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal"
import { DATA_TYPES, findFreeAttributeName } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: "Accept", useButton: true, disabled: true }

export default function CreateNewAttributeModal() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalCreateNewAtt = useSelector(selectModal(ModalEnum.CREATE_NEW_ATTRIBUTE));
    const attributes = useSelector(selectAttributes);

    const [attributeName, setAttributeName] = useState('');
    const [attributeType, setAttributeType] = useState(DATA_TYPES[0]);
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);

    const createUserAttribute = useCallback(() => {
        createAttribute(projectId, attributeName, attributeType.value, (res) => {
            const id = res?.data?.createUserAttribute.attributeId;
            if (id) {
                localStorage.setItem('isNewAttribute', "X");
                dispatch(setCurrentPage(CurrentPage.ATTRIBUTE_CALCULATION));
                router.push(`/projects/${projectId}/attributes/${id}`);
            }
        });
    }, [modalCreateNewAtt, attributeName, attributeType]);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: createUserAttribute, disabled: duplicateNameExists || attributeName.trim() == "" || attributeType == null });
    }, [modalCreateNewAtt, attributeName, attributeType, duplicateNameExists]);

    useEffect(() => {
        if (!attributes) return;
        setAttributeName(findFreeAttributeName(attributes));
    }, [attributes]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function handleAttributeName(value: string) {
        const valueToSave = toPythonFunctionName(value);
        const checkName = attributes.some(attribute => attribute.name == valueToSave);
        setAttributeName(valueToSave);
        setDuplicateNameExists(checkName);
    }

    return (<Modal modalName={ModalEnum.CREATE_NEW_ATTRIBUTE} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
            Add new attribute </div>
        <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
            Choose a name for your attribute and pick a datatype you want to use</div>
        <div className="grid grid-cols-2  gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
            <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.ATTRIBUTE_NAME} color="invert" placement="right">
                <span className="cursor-help  card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Attribute name</span></span>
            </Tooltip>
            <input type="text" value={attributeName} onChange={(e: any) => handleAttributeName(e.target.value)}
                onKeyDown={(e) => { if (e.key == 'Enter') createUserAttribute() }}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter an attribute name..." />
            <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.SELECT_ATTRIBUTE_TYPE} color="invert" placement="right">
                <span className="cursor-help card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Attribute type</span></span>
            </Tooltip>
            <Dropdown2 buttonName={attributeType ? attributeType.name : 'Select type'} options={DATA_TYPES} selectedOption={(option: any) => setAttributeType(option)} />
        </div>
        {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Attribute name exists</div>}
        {attributeType.name == 'Embedding List' && <div className="border border-gray-300 text-xs text-gray-500 p-2.5 rounded-lg text-justify mt-2 max-w-2xl">
            <label className="text-gray-700">
                Embedding lists are special. They can only be used for similarity search. If a list
                entry is matched, the whole record is considered matched.
            </label>
        </div>}
    </Modal>)
}