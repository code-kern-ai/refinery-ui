import Modal from "@/src/components/shared/modal/Modal";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { selectUniqueValuesDict, setUniqueValuesDict, } from "@/src/reduxStore/states/pages/data-browser";
import { selectEmbeddings, selectUsableAttributes } from "@/src/reduxStore/states/pages/settings";
import { FilterIntegrationOperator, SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { DataTypeEnum } from "@/src/types/shared/general";
import { filterAttributesSSGroup, getPlaceholderText, prepareAttFilter, prepareFilterAttributes } from "@/src/util/components/projects/projectId/data-browser/filter-attributes-helper";
import { checkDecimalPatterns, getAttributeType, getFilterIntegrationOperatorTooltip } from "@/src/util/components/projects/projectId/data-browser/search-operators-helper";
import { getColorForDataType } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { extendArrayElementsByUniqueId } from "@/submodules/javascript-functions/id-prep";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { getUniqueValuesByAttributes } from "@/src/services/base/dataSlices";
import { postProcessUniqueValues } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { MemoIconPlus, MemoIconTrash } from "@/submodules/react-components/components/kern-icons/icons";

const ACCEPT_BUTTON = { buttonCaption: 'Save', useButton: true };
const ABORT_BUTTON = { buttonCaption: 'Reset', useButton: true };
const FILTER_INTEGRATION_OPERATORS = Object.values(FilterIntegrationOperator).map(t => t.split("_").join(" "));
const FILTER_INTEGRATION_OPERATOR_TOOLTIPS = Object.values(FilterIntegrationOperator).map(t => getFilterIntegrationOperatorTooltip(t));

export default function PlaygroundSearchMetaFilterModal(props: { selectedEmbedding: Embedding, setMetaDataFilter: any }) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectUsableAttributes);
    const embeddings = useSelector(selectEmbeddings);
    const uniqueValuesDict = useSelector(selectUniqueValuesDict);

    const [filterAttributesSS, setFilterAttributesSS] = useState<any>(null);
    const [filterAttributesForm, setFilterAttributesForm] = useState<any>([]);
    const [operatorsDict, setOperatorsDict] = useState<{ [key: string]: string[] }>(null);
    const [colorsAttributes, setColorAttributes] = useState<string[]>([]);
    const [tooltipsDict, setTooltipsDict] = useState<{ [key: string]: string[] }>(null);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    useEffect(() => {
        if (!projectId) return;
        getUniqueValuesByAttributes(projectId, (res) => {
            dispatch(setUniqueValuesDict(postProcessUniqueValues(res, attributes)));
        });
    }, [projectId]);

    useEffect(() => {
        if (!embeddings || !props.selectedEmbedding) return;
        setFilterAttributesSS(prepareFilterAttributes(embeddings, props.selectedEmbedding.name));
    }, [embeddings, props.selectedEmbedding]);

    useEffect(() => {
        if (!filterAttributesSS) return;
        let colors = [];
        const newOperatorsDict = {};
        const newTooltipsDict = {};

        filterAttributesSS.forEach((attribute) => {
            const attributeType = attributes.find(att => att.name == attribute)?.dataType
            newOperatorsDict[attribute] = FILTER_INTEGRATION_OPERATORS.filter(operator => attributeType == DataTypeEnum.INTEGER || operator !== FilterIntegrationOperator.BETWEEN);
            newTooltipsDict[attribute] = FILTER_INTEGRATION_OPERATOR_TOOLTIPS.filter(tooltip => attributeType == DataTypeEnum.INTEGER || tooltip !== getFilterIntegrationOperatorTooltip(FilterIntegrationOperator.BETWEEN));
            colors.push(getColorForDataType(attributeType));
        });
        setOperatorsDict(newOperatorsDict);
        setTooltipsDict(newTooltipsDict);
        setColorAttributes(colors);
    }, [filterAttributesSS]);

    useEffect(() => {
        if (!operatorsDict) return;
        initFilterForm();
    }, [operatorsDict]);

    const cancelMetaDataFilter = useCallback(() => {
        props.setMetaDataFilter(null);
        initFilterForm();
    }, [props.setMetaDataFilter]);

    const updateMetaDataFilter = useCallback(() => {
        const attFilter = prepareAttFilter(filterAttributesForm, attributes, false);
        props.setMetaDataFilter(attFilter);
    }, [filterAttributesForm, attributes]);

    useEffect(() => {
        setAcceptButton({
            ...acceptButton, disabled: !filterAttributesSS, emitFunction: updateMetaDataFilter
        });
    }, [filterAttributesSS, updateMetaDataFilter]);

    useEffect(() => {
        setAbortButton({
            ...abortButton, emitFunction: cancelMetaDataFilter, disabled: !filterAttributesSS
        });
    }, [cancelMetaDataFilter, filterAttributesSS]);

    function initFilterForm() {
        if (!filterAttributesSS) return;
        if (!operatorsDict) return;
        let form = [];
        form.push(filterAttributesSSGroup(filterAttributesSS, operatorsDict, attributes));
        form = extendArrayElementsByUniqueId(form);
        setFilterAttributesForm(form);
    }

    function setFilterDropdownVal(value: any, index: number, key: string) {
        const getIdxForm = filterAttributesForm[index];
        if (key === "name") {
            const attributeType = getAttributeType(attributes, value);
            getIdxForm['addText'] = getPlaceholderText(attributeType);
            getIdxForm['searchValue'] = "";
            getIdxForm['searchValueBetween'] = "";
            getIdxForm['operator'] = operatorsDict[value][0];
        }
        getIdxForm[key] = value;
        const form = [...filterAttributesForm];
        form[index] = getIdxForm;
        setFilterAttributesForm(form);
    }

    function removeFilterAttributesSS(index: number) {
        setFilterAttributesForm(prevForm => prevForm.filter((_, i) => i !== index));
    }

    function checkIfDecimals(event: any, i: number, form: any) {
        const attributeType = getAttributeType(attributes, form.name);
        checkDecimalPatterns(attributeType, event, form.operator, '-');
    }

    function addFilterAttributesSS() {
        setFilterAttributesForm(prevForm => {
            const newForm = [
                ...prevForm,
                filterAttributesSSGroup(filterAttributesSS, operatorsDict, attributes)
            ];
            return extendArrayElementsByUniqueId(newForm);
        });
    }

    return (
        <Modal modalName={ModalEnum.EVALUATION_META_FILTER_APPLY} acceptButton={acceptButton} abortButton={abortButton} className={`${!filterAttributesSS ? '' : 'md:max-w-6xl'}`}>
            <div className="contents mx-2">
                {!filterAttributesSS && <div className="text-sm inline-block font-normal text-gray-500 italic mx-3">No filter attributes defined for selected embedding.</div>}
                {filterAttributesForm && filterAttributesForm.map((form, index) => (<div key={form.id} className="contents mx-2">
                    <div className="flex flex-row items-center rounded-md hover:bg-gray-50 my-2">
                        <div className="flex flex-col">
                            {filterAttributesForm.length > 1 &&
                                <div onClick={() => removeFilterAttributesSS(index)}
                                    className="mt-2 cursor-pointer flex justify-center hover:border-transparent hover:bg-transparent border-transparent bg-transparent px-0">
                                    <MemoIconTrash className="text-gray-900 cursor-pointer h-4 w-4" />
                                </div>}
                        </div>
                        <div className="flex-grow mr-2.5 flex flex-col  mt-2 ">
                            <div className="flex-grow flex flex-row flex-wrap gap-1">
                                <div style={{ width: '50%' }}>
                                    <KernDropdown options={filterAttributesSS} buttonName={form.name} backgroundColors={colorsAttributes}
                                        selectedOption={(option: any) => setFilterDropdownVal(option, index, 'name')} fontClass="font-dmMono" />
                                </div>
                                <div style={{ width: '49%' }}>
                                    <KernDropdown options={operatorsDict[form.name]} buttonName={form.operator} tooltipsArray={tooltipsDict[form.operator]} tooltipArrayPlacement="left"
                                        selectedOption={(option: any) => setFilterDropdownVal(option, index, 'operator')} fontClass="font-dmMono" />
                                </div>
                            </div>
                            {uniqueValuesDict[form['name']] && form['operator'] != '' && form['operator'] == 'EQUAL' ? (
                                <div className="w-full mt-2">
                                    <KernDropdown options={uniqueValuesDict[form['name']]} buttonName={form['searchValue'] ? form['searchValue'] : 'Select value'}
                                        selectedOption={(option: string) => setFilterDropdownVal(option, index, 'searchValue')} fontClass="font-dmMono" />
                                </div>
                            ) : (<div className="my-2 flex-grow flex flex-row items-center">
                                {form.operator != '' && <input placeholder={form.addText} value={form.searchValue}
                                    onChange={(e) => setFilterDropdownVal(e.target.value, index, 'searchValue')}
                                    onKeyDown={(e) => checkIfDecimals(e, index, form)}
                                    className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}
                                {form.operator == SearchOperator.BETWEEN && <span className="text-sm text-gray-500 mx-1">AND</span>}
                                {form.operator == SearchOperator.BETWEEN && <input placeholder={form.addText} value={form.searchValueBetween}
                                    onChange={(e) => setFilterDropdownVal(e.target.value, index, 'searchValueBetween')}
                                    onKeyDown={(e) => checkIfDecimals(e, index, form)}
                                    className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}
                            </div>)}

                        </div>
                    </div>
                    <div className="w-full flex justify-center">
                        {index == filterAttributesForm.length - 1 &&
                            <span onClick={() => addFilterAttributesSS()}
                                className="bg-gray-100 text-gray-800 cursor-pointer p-1 rounded-md hover:bg-gray-300">
                                <MemoIconPlus className="cursor-pointer" />
                            </span>}
                    </div>
                </div>))}
            </div>
        </Modal>
    )
}