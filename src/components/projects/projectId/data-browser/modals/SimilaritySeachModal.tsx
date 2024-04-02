import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectActiveSearchParams, selectSimilaritySearch, selectUniqueValuesDict, setRecordsInDisplay, setSearchRecordsExtended } from "@/src/reduxStore/states/pages/data-browser";
import { selectEmbeddings, selectLabelingTasksAll, selectOnAttributeEmbeddings, selectUsableAttributes } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { getRecordsBySimilarity } from "@/src/services/base/data-browser";
import { FilterIntegrationOperator, SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { DataTypeEnum } from "@/src/types/shared/general";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { postProcessRecordsExtended } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { filterAttributesSSGroup, getPlaceholderText, prepareAttFilter, prepareFilterAttributes } from "@/src/util/components/projects/projectId/data-browser/filter-attributes-helper";
import { checkDecimalPatterns, getAttributeType, getFilterIntegrationOperatorTooltip } from "@/src/util/components/projects/projectId/data-browser/search-operators-helper";
import { getColorForDataType } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { extendArrayElementsByUniqueId } from "@/submodules/javascript-functions/id-prep";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";
import { useLazyQuery } from "@apollo/client";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Search', useButton: true, disabled: false };
const SECOND_ACCEPT_BUTTON = { buttonCaption: 'Search without filter', useButton: true, disabled: false };

export default function SimilaritySearchModal() {
    const dispatch = useDispatch();

    const modalSS = useSelector(selectModal(ModalEnum.SIMILARITY_SEARCH));
    const activeSearchParams = useSelector(selectActiveSearchParams);
    const similaritySearch = useSelector(selectSimilaritySearch);
    const embeddings = useSelector(selectEmbeddings);
    const attributes = useSelector(selectUsableAttributes);
    const projectId = useSelector(selectProjectId);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const uniqueValuesDict = useSelector(selectUniqueValuesDict);
    const onAttributeEmbeddings = useSelector(selectOnAttributeEmbeddings);

    const [filterAttributesSS, setFilterAttributesSS] = useState<any>(null);
    const [filterAttributesForm, setFilterAttributesForm] = useState<any>([]);
    const [selectedEmbedding, setSelectedEmbedding] = useState<Embedding>(null);
    const [colorsAttributes, setColorAttributes] = useState<string[]>([]);
    const [operatorsDict, setOperatorsDict] = useState<{ [key: string]: string[] }>({});
    const [tooltipsDict, setTooltipsDict] = useState<{ [key: string]: string[] }>({});


    function getSimilarRecords(hasFilter: boolean = false) {
        const attFilter = hasFilter ? prepareAttFilter(filterAttributesForm, attributes) : null;
        getRecordsBySimilarity(projectId, selectedEmbedding.id, modalSS.recordId, attFilter, null, (res) => {
            dispatch(setSearchRecordsExtended(postProcessRecordsExtended(res.data['searchRecordsBySimilarity'], labelingTasks)));
            dispatch(setRecordsInDisplay(true));
        });
    }

    const requestSimilaritySearch = useCallback(() => {
        getSimilarRecords(true);
    }, [modalSS, selectedEmbedding]);

    const requestSimilaritySearchWithoutFilter = useCallback(() => {
        getSimilarRecords(false);
    }, [modalSS, selectedEmbedding]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: requestSimilaritySearch, disabled: selectedEmbedding == null });
        setSecondAcceptButton({ ...SECOND_ACCEPT_BUTTON, emitFunction: requestSimilaritySearchWithoutFilter, useButton: filterAttributesSS, disabled: selectedEmbedding == null });
    }, [modalSS, selectedEmbedding, filterAttributesSS]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);
    const [secondAcceptButton, setSecondAcceptButton] = useState<ModalButton>(SECOND_ACCEPT_BUTTON);

    useEffect(() => {
        if (!embeddings || !selectedEmbedding) return;
        setFilterAttributesSS(prepareFilterAttributes(embeddings, selectedEmbedding.name));
    }, [embeddings, selectedEmbedding]);

    useEffect(() => {
        if (!filterAttributesSS) return;
        prepareOperatorsAndTooltips();
    }, [filterAttributesSS, selectedEmbedding]);

    useEffect(() => {
        if (!operatorsDict) return;
        initFilterForm();
    }, [operatorsDict]);

    function prepareOperatorsAndTooltips() {
        if (!filterAttributesSS) return;
        let operators = [];
        let tooltips = [];
        let colors = [];
        let operatorsCopy = { ...operatorsDict };
        let tooltipsCopy = { ...tooltipsDict };
        for (let t of Object.values(FilterIntegrationOperator)) {
            operators.push(t.split("_").join(" "));
            tooltips.push(getFilterIntegrationOperatorTooltip(t));
        }
        filterAttributesSS.forEach((attribute: string) => {
            const attributeType = attributes.find(att => att.name == attribute)?.dataType
            if (attributeType !== DataTypeEnum.INTEGER) {
                operators = operators.filter(operator => operator !== FilterIntegrationOperator.BETWEEN);
                tooltips = tooltips.filter(tooltip => tooltip !== getFilterIntegrationOperatorTooltip(FilterIntegrationOperator.BETWEEN));
            }
            operatorsCopy[attribute] = operators;
            tooltipsCopy[attribute] = tooltips;
            colors.push(getColorForDataType(attributeType));
        });
        setOperatorsDict(operatorsCopy);
        setTooltipsDict(tooltipsCopy);
        setColorAttributes(colors);
    }

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
        const form = [...filterAttributesForm];
        form.splice(index, 1);
        setFilterAttributesForm(form);

    }

    function checkIfDecimals(event: any, i: number, form: any) {
        const attributeType = getAttributeType(attributes, form.name);
        checkDecimalPatterns(attributeType, event, form.operator, '-');
    }

    function addFilterAttributesSS() {
        let form = [...filterAttributesForm];
        form.push(filterAttributesSSGroup(filterAttributesSS, operatorsDict, attributes));
        form = extendArrayElementsByUniqueId(form);
        setFilterAttributesForm(form);
    }

    return (<Modal modalName={ModalEnum.SIMILARITY_SEARCH} acceptButton={acceptButton} secondAcceptButton={secondAcceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Select embedding for similarity search </div>
        {(activeSearchParams.length > 0 || similaritySearch.recordsInDisplay) && <div className="text-red-500 mb-2 flex flex-grow justify-center text-sm">Warning: your current filter selection will be removed!</div>}

        <Dropdown2 options={onAttributeEmbeddings} buttonName={selectedEmbedding ? selectedEmbedding.name : 'Select embedding'} selectedOption={(value) => setSelectedEmbedding(value)} dropdownClasses="my-2" />

        {filterAttributesSS && filterAttributesSS.length > 0 && <div className="flex flex-col justify-start mt-4">
            <div className="pr-2 bg-white text-md font-medium text-gray-900">Filter attributes</div>
            <div className="text-sm text-gray-400">You can filter similarity search based on the attributes selected when
                creating the embedding</div>
        </div>}

        <div className="contents mx-2">
            {filterAttributesForm && filterAttributesForm.map((form, index) => (<div key={form.id} className="contents mx-2">
                <div className="flex flex-row items-center rounded-md hover:bg-gray-50 my-2">
                    <div className="flex flex-col">
                        {filterAttributesForm.length > 1 &&
                            <div onClick={() => removeFilterAttributesSS(index)}
                                className="mt-2 cursor-pointer flex justify-center hover:border-transparent hover:bg-transparent border-transparent bg-transparent px-0">
                                <IconTrash className="text-gray-900 cursor-pointer h-4 w-4" />
                            </div>}
                    </div>
                    <div className="flex-grow mr-2.5 flex flex-col  mt-2 ">
                        <div className="flex-grow flex flex-row flex-wrap gap-1">
                            <div style={{ width: '50%' }}>
                                <Dropdown2 options={filterAttributesSS} buttonName={form.name} backgroundColors={colorsAttributes}
                                    selectedOption={(option: any) => setFilterDropdownVal(option, index, 'name')} fontClass="font-dmMono" />
                            </div>
                            <div style={{ width: '49%' }}>
                                <Dropdown2 options={operatorsDict[form.name]} buttonName={form.operator} tooltipsArray={tooltipsDict[form.operator]} tooltipArrayPlacement="left"
                                    selectedOption={(option: any) => setFilterDropdownVal(option, index, 'operator')} fontClass="font-dmMono" />
                            </div>
                        </div>
                        {uniqueValuesDict[form['name']] && form['operator'] != '' && form['operator'] == 'EQUAL' ? (
                            <div className="w-full mt-2">
                                <Dropdown2 options={uniqueValuesDict[form['name']]} buttonName={form['searchValue'] ? form['searchValue'] : 'Select value'}
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
                            <IconPlus className="cursor-pointer" />
                        </span>}
                </div>
            </div>))}
        </div>

    </Modal>
    )
}