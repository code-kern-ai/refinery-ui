import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Statuses from "@/src/components/shared/statuses/Statuses";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { selectAttributes, updateAttributeById } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { UPDATE_ATTRIBUTE } from "@/src/services/gql/mutations/project-settings";
import { Attribute, DataSchemaProps } from "@/src/types/components/projects/projectId/settings/data-schema";
import { CurrentPage } from "@/src/types/shared/general";
import { ATTRIBUTES_VISIBILITY_STATES, getTooltipVisibilityState } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-contants";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DataSchema(props: DataSchemaProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const project = useSelector(selectProject)
    const attributes = useSelector(selectAttributes);

    const [somethingLoading, setSomethingLoading] = useState(false);
    const [tooltipsArray, setTooltipsArray] = useState<string[]>(null);

    const [updateAttributeMut] = useMutation(UPDATE_ATTRIBUTE);

    useEffect(() => {
        setSomethingLoading(attributes.length === 0);
        if (!attributes) return;
        const tooltipsPreps = [];
        ATTRIBUTES_VISIBILITY_STATES.forEach((state) => {
            tooltipsPreps.push(getTooltipVisibilityState(state.value));
        });
        setTooltipsArray(tooltipsPreps);
    }, [attributes]);


    function updatePrimaryKey(attribute: Attribute) {
        const attributeNew = jsonCopy(attribute);
        attributeNew.isPrimaryKey = !attributeNew.isPrimaryKey;
        updateAttributeMut({ variables: { projectId: project.id, attributeId: attributeNew.id, isPrimaryKey: attributeNew.isPrimaryKey } }).then(() => {
            dispatch(updateAttributeById(attributeNew));
        });
    }

    function updateVisibility(option: string, attribute: Attribute) {
        const visibility = ATTRIBUTES_VISIBILITY_STATES.find((state) => state.name === option).value;
        const attributeNew = jsonCopy(attribute);
        attributeNew.visibility = visibility;
        attributeNew.visibilityIndex = ATTRIBUTES_VISIBILITY_STATES.findIndex((state) => state.name === option);
        updateAttributeMut({ variables: { projectId: project.id, attributeId: attribute.id, visibility: attributeNew.visibility } }).then(() => {
            dispatch(updateAttributeById(attributeNew));
        });
    }

    return (<div>
        <div className="text-lg leading-6 text-gray-900 font-medium flex items-center">
            <span>Data schema</span>
            {props.isAcOrTokenizationRunning ? <LoadingIcon /> : null}
        </div>
        <div className="mt-1">
            <div className="text-sm leading-5 font-medium text-gray-700 inline-block">
                This schema holds the data structure of your project.
                It contains the attributes uploaded on project creation and the added calculated attributes.
            </div>
            <div className="inline-block min-w-full align-middle">
                <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Name</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Data Type</th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    <div className="flex flex-row flex-nowrap items-center justify-center leading-3">
                                        <span>Primary Key</span>
                                        <div className="inline-block w-4 h-3.5">
                                            {props.pKeyValid != null && <>
                                                {props.pKeyValid ? <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.DATA_SCHEMA.UNIQUE_COMBINATION} color="invert" placement="bottom">
                                                    <IconCheck className="h-5 w-5 -mt-1" />
                                                </Tooltip> :
                                                    <Tooltip content={TOOLTIPS_DICT.PROJECT_SETTINGS.DATA_SCHEMA.NOT_UNIQUE_COMBINATION} color="invert" placement="bottom">
                                                        <IconX className="h-5 w-5 -mt-1" />
                                                    </Tooltip>}
                                            </>}
                                        </div>
                                    </div>
                                </th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    State
                                </th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Visibility
                                </th>
                                <th scope="col"
                                    className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Modify
                                </th>
                            </tr>
                        </thead>
                        {!somethingLoading ? <tbody className="divide-y divide-gray-200">
                            {
                                attributes.map((attribute: Attribute, index: number) => (
                                    <tr key={attribute.id} className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {attribute.name}
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            {attribute.dataTypeName}
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            <label className="cursor-pointer">
                                                <input type="checkbox" checked={attribute.isPrimaryKey} onChange={() => updatePrimaryKey(attribute)} />
                                            </label>
                                        </td>
                                        <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                            <Statuses status={attribute.state} page="attributes" initialCaption="Registered" />
                                        </td>
                                        <td className="text-center px-3 py-2 text-sm text-gray-500">
                                            <Dropdown buttonName={ATTRIBUTES_VISIBILITY_STATES[attribute.visibilityIndex].name} options={ATTRIBUTES_VISIBILITY_STATES} dropdownWidth="w-52"
                                                selectedOption={(option: string) => updateVisibility(option, attribute)} tooltipsArray={tooltipsArray} />
                                        </td>
                                        <td className="text-center px-3 py-2 text-sm text-gray-500">
                                            {attribute.userCreated ? <button type="button" className="text-green-800 text-sm font-medium"
                                                onClick={() => {
                                                    dispatch(setCurrentPage(CurrentPage.ATTRIBUTE_CALCULATION));
                                                    router.push(`/projects/${project.id}/attributes/${attribute.id}`);
                                                }}>
                                                <span className="leading-5">Details</span>
                                                <IconArrowRight className="h-5 w-5 inline-block text-green-800" />
                                            </button> : <label className="text-gray-500 italic">Not changeable</label>}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody> : <tbody>
                            <tr>
                                <td colSpan={6} className="text-center p-1">
                                    <LoadingIcon />
                                </td>
                            </tr>
                        </tbody>}
                    </table>
                </div>
            </div >
        </div >
    </div >)
}