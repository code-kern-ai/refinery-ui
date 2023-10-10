import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Statuses from "@/src/components/shared/statuses/Statuses";
import { selectAttributes, setAllAttributes, updateAttributeById } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project"
import { UPDATE_ATTRIBUTE } from "@/src/services/gql/mutations/project";
import { GET_ATTRIBUTES_BY_PROJECT_ID } from "@/src/services/gql/queries/project";
import { Attribute, AttributeState } from "@/src/types/components/projects/projectId/settings/data-schema";
import { DataTypeEnum } from "@/src/types/shared/general";
import { ATTRIBUTES_VISIBILITY_STATES, DATA_TYPES, getTooltipVisibilityState, postProcessingAttributes } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"

export default function AttributeCalculation() {
    const router = useRouter();
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);

    const [currentAttribute, setCurrentAttribute] = useState<Attribute>(null);
    const [isHeaderNormal, setIsHeaderNormal] = useState(true);
    const [isNameOpen, setIsNameOpen] = useState(false);
    const [isNameLoading, setIsNameLoading] = useState(false);
    const [duplicateNameExists, setDuplicateNameExists] = useState(false);
    const [tooltipsArray, setTooltipsArray] = useState<string[]>([]);

    const [refetchAttributes] = useLazyQuery(GET_ATTRIBUTES_BY_PROJECT_ID, { fetchPolicy: "network-only" });
    const [updateAttributeMut] = useMutation(UPDATE_ATTRIBUTE);


    useEffect(() => {
        if (!router.query.attributeId) return;
        setCurrentAttribute(attributes.find((attribute) => attribute.id === router.query.attributeId));
    }, [attributes, router.query.attributeId]);

    useEffect(() => {
        if (!project) return;
        if (!currentAttribute && attributes.length == 0) {
            refetchAttributes({ variables: { projectId: project.id, stateFilter: ['ALL'] } }).then((res) => {
                dispatch(setAllAttributes(postProcessingAttributes(res.data['attributesByProjectId'])));
                setCurrentAttribute(attributes.find((attribute) => attribute.id === router.query.attributeId));
            });
        }
    }, [project, currentAttribute]);

    useEffect(() => {
        if (!attributes) return;
        const tooltipsPreps = [];
        ATTRIBUTES_VISIBILITY_STATES.forEach((state) => {
            tooltipsPreps.push(getTooltipVisibilityState(state.value));
        });
        setTooltipsArray(tooltipsPreps);
    }, [attributes]);

    function openName(open: boolean) {
        setIsNameOpen(open);
    }

    function changeAttributeName(name: string) {
    }

    function updateVisibility(option: string) {
        const visibility = ATTRIBUTES_VISIBILITY_STATES.find((state) => state.name === option).value;
        const attributeNew = jsonCopy(currentAttribute);
        attributeNew.visibility = visibility;
        attributeNew.visibilityIndex = ATTRIBUTES_VISIBILITY_STATES.findIndex((state) => state.name === option);
        updateAttributeMut({ variables: { projectId: project.id, attributeId: currentAttribute.id, visibility: attributeNew.visibility } }).then(() => {
            setCurrentAttribute(attributeNew);
            dispatch(updateAttributeById(attributeNew));
        });
    }

    function updateDataType(option: string) {
    }

    return (project && <div className="bg-white p-4 overflow-y-auto h-screen">
        {currentAttribute && <div>
            <div className={`sticky z-40 h-12 ${isHeaderNormal ? 'top-1' : '-top-5'}`}>
                <div className={`bg-white flex-grow ${isHeaderNormal ? '' : 'shadow'}`}>
                    <div className={`flex-row justify-start items-center inline-block ${isHeaderNormal ? 'p-0' : 'flex py-2'}`} style={{ transition: 'all .25s ease-in-out' }}>
                        <button onClick={() => router.push(`/projects/${project.id}/settings`)}
                            className="text-green-800 text-sm font-medium">
                            <IconArrowLeft className="h-5 w-5 inline-block text-green-800" />
                            <span className="leading-5">Go back</span>
                        </button>
                        {!isHeaderNormal && <div className="mx-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentAttribute.name}</div>}
                        <Statuses status={currentAttribute.state} page="attributes" initialCaption="Registered" />
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className={`grid gap-4 ${isHeaderNormal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {isHeaderNormal && <div className="flex items-center mt-2">
                        <Tooltip color="invert" placement="right" content={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING ? 'Cannot edit attribute\'s name, attribute is in use' : 'Edit your attribute\'s name'}>
                            <button onClick={() => openName(true)} disabled={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING}
                                className={`flex-shrink-0 bg-white text-gray-700 text-xs font-semibold mr-3 px-4 py-2 rounded-md border border-gray-300 block float-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING}`}>
                                Edit name
                            </button>
                        </Tooltip>
                        <div className="inline-block" onDoubleClick={() => openName(true)}>
                            {(isNameOpen && currentAttribute.state != AttributeState.USABLE && currentAttribute.state != AttributeState.RUNNING)
                                ? (<input type="text" value={currentAttribute.name} onInput={(e: any) => changeAttributeName(e.target.value)}
                                    onBlur={() => openName(false)} onKeyDown={(e) => { if (e.key == 'Enter') openName(false) }}
                                    className="h-8 border-gray-300 rounded-md placeholder-italic border text-gray-700 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />)
                                : (<div className="mr-4 text-sm leading-5 font-medium text-gray-500 inline-block">{currentAttribute.name}</div>)}
                            {isNameLoading && <LoadingIcon />}
                        </div>
                    </div>}
                </div>
                {duplicateNameExists && <div className="text-red-700 text-xs mt-2">Attribute name exists</div>}
                <div className="grid grid-cols-2 gap-2 items-center mt-8" style={{ gridTemplateColumns: 'max-content auto' }}>
                    <div className="text-sm leading-5 font-medium text-gray-700">Visibility</div>
                    <Dropdown buttonName={currentAttribute.visibilityName} options={ATTRIBUTES_VISIBILITY_STATES} dropdownWidth="w-52"
                        selectedOption={(option: string) => updateVisibility(option)} tooltipsArray={tooltipsArray} tooltipArrayPlacement="right" />
                    <div className="text-sm leading-5 font-medium text-gray-700">Data type</div>
                    <div>
                        <Tooltip color="invert" placement="right" content={currentAttribute.state == AttributeState.USABLE || currentAttribute.state == AttributeState.RUNNING ? 'Cannot edit data type' : 'Edit your data type'}>
                            <Dropdown buttonName={currentAttribute.dataTypeName} options={DATA_TYPES} dropdownWidth="w-52"
                                selectedOption={(option: string) => updateDataType(option)} />
                        </Tooltip>
                        {currentAttribute.dataType == DataTypeEnum.EMBEDDING_LIST && <div className="text-gray-700 text-sm">Only useable for similarity search</div>}
                    </div>
                    <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Attributes</div>
                    <div className="flex flex-row items-center"></div>

                </div>
            </div>
        </div>}
    </div>)
}