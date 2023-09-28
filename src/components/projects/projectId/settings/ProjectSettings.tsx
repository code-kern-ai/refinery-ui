import { useDispatch, useSelector } from "react-redux";
import DataSchema from "./DataSchema";
import { selectProject } from "@/src/reduxStore/states/project";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CHECK_COMPOSITE_KEY, GET_ATTRIBUTES_BY_PROJECT_ID } from "@/src/services/gql/queries/project";
import { use, useCallback, useEffect, useState } from "react";
import { selectAttributes, setAllAttributes } from "@/src/reduxStore/states/pages/settings";
import { DATA_TYPES, postProcessingAttributes } from "@/src/util/components/projects/projectId/settings-helper";
import { timer } from "rxjs";
import { IconPlus } from "@tabler/icons-react";
import Modal from "@/src/components/shared/modal/Modal";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { openModal } from "@/src/reduxStore/states/modal";
import { Tooltip } from "@nextui-org/react";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { CREATE_USER_ATTRIBUTE } from "@/src/services/gql/mutations/project";
import { useRouter } from "next/router";
import { toPythonFunctionName } from "@/submodules/javascript-functions/python-functions-parser";

const ACCEPT_BUTTON = { buttonCaption: "Accept", useButton: true, disabled: true }

export default function ProjectSettings() {
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);

    const [pKeyValid, setPKeyValid] = useState<boolean | null>(null);
    const [pKeyCheckTimer, setPKeyCheckTimer] = useState(null);
    const [attributeName, setAttributeName] = useState("");
    const [attributeType, setAttributeType] = useState("Text");
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [refetchPrimaryKey] = useLazyQuery(CHECK_COMPOSITE_KEY, { fetchPolicy: "no-cache" });
    const [createAttributeMut] = useMutation(CREATE_USER_ATTRIBUTE);

    useEffect(() => {
        if (!project) return;
        refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
            dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
        });
    }, [project]);

    useEffect(() => {
        requestPKeyCheck();
    }, [attributes]);

    const createUserAttribute = useCallback((attributeName: string) => {
        const attributeTypeFinal = DATA_TYPES.find((type) => type.name === attributeType).value;
        createAttributeMut({ variables: { projectId: project.id, name: attributeName, dataType: attributeTypeFinal } }).then((res) => {
            const id = res?.data?.createUserAttribute.attributeId;
            if (id) {
                localStorage.setItem('isNewAttribute', "X");
                router.push(`/projects/${project.id}/attributes/${id}`);
            }
        });
    }, [attributeName, attributeType, duplicateNameExists]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function handleAttributeName(value: string) {
        const checkName = attributes.some(attribute => attribute.name == value);
        setDuplicateNameExists(checkName);
        setAcceptButton({ ...acceptButton, disabled: checkName || value.trim() == "" })
        setAttributeName(toPythonFunctionName(value));
    }

    useEffect(() => {
        setAcceptButton({ ...acceptButton, emitFunction: () => createUserAttribute(attributeName) });
    }, [attributeName, attributeType, duplicateNameExists]);

    function requestPKeyCheck() {
        if (!project) return;
        setPKeyValid(null);
        if (pKeyCheckTimer) pKeyCheckTimer.unsubscribe();
        const tmpTimer = timer(500).subscribe(() => {
            refetchPrimaryKey({ variables: { projectId: project.id } }).then((res) => {
                setPKeyCheckTimer(null);
                if (anyPKey()) setPKeyValid(res.data['checkCompositeKey']);
                else setPKeyValid(null);
            });
        });
        setPKeyCheckTimer(tmpTimer);
    }

    function anyPKey() {
        if (!attributes) return false;
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].isPrimaryKey) return true;
        }
        return false;
    }

    return (<div>
        {project != null && <div className="p-4 bg-gray-100 h-screen overflow-y-auto flex-1 flex flex-col">
            {/* TODO: update the isAcOrTokenizationRunning when the tokenization is added */}
            <DataSchema isAcOrTokenizationRunning={false} pKeyValid={pKeyValid} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-1 align-top">
                <div className="items-center flex flex-row">
                    <Tooltip content="Add new attribute" color="invert" placement="bottom">
                        <label onClick={() => dispatch(openModal(ModalEnum.CREATE_NEW_ATTRIBUTE))}
                            className="mr-1 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                            <IconPlus className="mr-1 h-5 w-5 inline-block" />
                            Add new attribute
                        </label>
                    </Tooltip>
                </div>
            </div>
            <Modal modalName={ModalEnum.CREATE_NEW_ATTRIBUTE} acceptButton={acceptButton}>
                <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">
                    Add new attribute </div>
                <div className="mb-2 flex flex-grow justify-center text-sm text-gray-500">
                    Choose a name for your attribute and pick a datatype you want to use</div>
                <div className="grid grid-cols-2  gap-2 items-center" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <Tooltip content="Enter an attribute name" color="invert" placement="right">
                        <span className="cursor-help  card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Attribute name</span></span>
                    </Tooltip>
                    <input type="text" value={attributeName} onInput={(e: any) => {
                        handleAttributeName(e.target.value);
                    }} onKeyDown={(e) => { if (e.key == 'Enter') createUserAttribute(attributeName) }}
                        className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter an attribute name..." />
                    {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Attribute name exists</div>}
                    <Tooltip content="Select an attribute type" color="invert" placement="right">
                        <span className="cursor-help card-title mb-0 label-text font-normal"><span className="underline filtersUnderline">Attribute type</span></span>
                    </Tooltip>
                    <Dropdown buttonName={attributeType} options={DATA_TYPES} selectedOption={(option: string) => setAttributeType(option)} />
                </div>
                {/* TODO: Add condition for embedding lists */}
            </Modal>
        </div >}
    </div >)
}