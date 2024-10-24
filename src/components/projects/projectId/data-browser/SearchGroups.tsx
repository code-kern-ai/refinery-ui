import { selectAttributesDict, selectLabelingTasksAll, selectVisibleAttributesHeuristics } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { attributeCreateSearchGroup, commentsCreateSearchGroup, generateRandomSeed, getBasicGroupItems, getBasicSearchGroup, getBasicSearchItem, labelingTasksCreateSearchGroup, orderByCreateSearchGroup, userCreateSearchGroup } from "@/src/util/components/projects/projectId/data-browser/search-groups-helper";
import { SearchGroup, Slice, StaticOrderByKeys } from "@/submodules/javascript-functions/enums/enums";
import { IconArrowDown, IconArrowsRandom, IconFilterOff, IconPlus, IconPointerOff, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/data-browser.module.css';
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { checkDecimalPatterns, getAttributeType, getSearchOperatorTooltip } from "@/src/util/components/projects/projectId/data-browser/search-operators-helper";
import { DataTypeEnum } from "@/src/types/shared/general";
import { selectAllUsers, selectUser } from "@/src/reduxStore/states/general";
import { selectActiveSearchParams, selectActiveSlice, selectAdditionalData, selectConfiguration, selectDataSlicesAll, selectFullSearchStore, selectIsTextHighlightNeeded, selectRecords, selectSearchGroupsStore, selectSimilaritySearch, selectTextHighlight, selectUniqueValuesDict, setActiveSearchParams, setFullSearchStore, setIsTextHighlightNeeded, setRecordsInDisplay, setSearchGroupsStore, setSearchRecordsExtended, setTextHighlight, updateAdditionalDataState } from "@/src/reduxStore/states/pages/data-browser";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { DataSliceOperations } from "./DataSliceOperations";
import { getActiveNegateGroupColor, postProcessRecordsExtended } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { parseFilterToExtended } from "@/src/util/components/projects/projectId/data-browser/filter-parser-helper";
import { getRegexFromFilter, updateSearchParameters } from "@/src/util/components/projects/projectId/data-browser/search-parameters";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { getColorForDataType } from "@/src/util/components/projects/projectId/settings/data-schema-helper";
import { Status } from "@/src/types/shared/statuses";
import { postProcessCurrentWeakSupervisionRun } from "@/src/util/components/projects/projectId/heuristics/heuristics-helper";
import { AttributeVisibility } from "@/src/types/components/projects/projectId/settings/data-schema";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import KernDropdown from "@/submodules/react-components/components/KernDropdown";
import { checkActiveGroups, prefillActiveValues } from "@/src/util/components/projects/projectId/data-browser/prefill-values-helper";
import { getWeakSupervisionRun } from "@/src/services/base/heuristic";
import { getRecordsByStaticSlice, searchRecordsExtended } from "@/src/services/base/data-browser";
import { staticDataSlicesCurrentCount } from "@/src/services/base/dataSlices";

const GROUP_SORT_ORDER = 0;
let GLOBAL_SEARCH_GROUP_COUNT = 0;

export default function SearchGroups() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const attributes = useSelector(selectVisibleAttributesHeuristics);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const users = useSelector(selectAllUsers);
    const attributesDict = useSelector(selectAttributesDict);
    const activeSearchParams = useSelector(selectActiveSearchParams);
    const configuration = useSelector(selectConfiguration);
    const user = useSelector(selectUser);
    const activeSlice = useSelector(selectActiveSlice);
    const textHighlight = useSelector(selectTextHighlight);
    const isTextHighlightNeeded = useSelector(selectIsTextHighlightNeeded);
    const uniqueValuesDict = useSelector(selectUniqueValuesDict);
    const additionalData = useSelector(selectAdditionalData);
    const dataSlices = useSelector(selectDataSlicesAll);
    const fullSearchStore = useSelector(selectFullSearchStore);
    const searchGroupsStore = useSelector(selectSearchGroupsStore);
    const recordList = useSelector(selectRecords).recordList;
    const recordsInDisplay = useSelector(selectSimilaritySearch).recordsInDisplay;

    const [searchGroupsOrder, setSearchGroupsOrder] = useState<{ order: number; key: string }[]>([]);
    const [attributesSortOrder, setAttributeSortOrder] = useState([]);
    const [operatorsDropdown, setOperatorsDropdown] = useState([]);
    const [tooltipsArray, setTooltipArray] = useState([]);
    const [saveAttributeType, setSaveAttributeType] = useState(null);
    const [manualLabels, setManualLabels] = useState([]);
    const [weakSupervisionLabels, setWeakSupervisionLabels] = useState([]);
    const [backgroundColors, setBackgroundColors] = useState<string[]>([]);
    const [currentWeakSupervisionRun, setCurrentWeakSupervisionRun] = useState(null);
    const [selectedHeuristicsWS, setSelectedHeuristicsWS] = useState<string[]>([]);

    useEffect(() => {
        if (!projectId || !users || !labelingTasks || !attributesSortOrder) return;
        prepareSearchGroups();
        refetchCurrentWeakSupervisionAndProcess();
    }, [projectId, users, labelingTasks, attributesSortOrder]);

    useEffect(() => {
        if (!attributes) return;
        const attributesSort = [];
        const colors = [];
        const visibleAttributes = attributes.filter((a) => a.visibility == AttributeVisibility.DO_NOT_HIDE);
        attributesSort.push({
            name: 'Any Attribute',
            key: null,
            order: 0,
            type: 'TEXT'
        });
        colors.push('gray');
        visibleAttributes.forEach((att) => {
            attributesSort.push({
                name: att.name,
                key: att.id,
                order: att.relativePosition,
                type: att.dataType,
            });
            colors.push(getColorForDataType(att.dataType));
        });
        setBackgroundColors(colors);
        setAttributeSortOrder(attributesSort);
    }, [attributes]);

    useEffect(() => {
        if (!attributesSortOrder || !searchGroupsStore) return;
        if (!fullSearchStore || !fullSearchStore[SearchGroup.ATTRIBUTES]) return;
        getOperatorDropdownValues();
    }, [searchGroupsStore, attributesSortOrder]);

    useEffect(() => {
        if (!user || !activeSearchParams || !labelingTasks || !attributes || !projectId) return;
        if (!fullSearchStore || fullSearchStore[SearchGroup.DRILL_DOWN] == undefined) return;
        if (recordsInDisplay) return;
        refreshTextHighlightNeeded();
        setHighlightingToRecords();
        if (!(activeSlice && activeSlice.static)) {
            dispatch(updateAdditionalDataState('loading', true));
            const refetchTimer = setTimeout(() => {
                searchRecordsExtended(projectId, parseFilterToExtended(activeSearchParams, attributes, configuration, labelingTasks, user, fullSearchStore[SearchGroup.DRILL_DOWN]), 0, 20, (res) => {
                    dispatch(setSearchRecordsExtended(postProcessRecordsExtended(res.data['searchRecordsExtended'], labelingTasks)));
                    dispatch(updateAdditionalDataState('loading', false));
                });
            }, 500);
            return () => clearTimeout(refetchTimer);
        }
    }, [activeSearchParams, user, projectId, attributes, labelingTasks, configuration]);

    useEffect(() => {
        if (!user || !activeSearchParams || !labelingTasks || !attributes || !projectId) return;
        if (!fullSearchStore || fullSearchStore[SearchGroup.DRILL_DOWN] == undefined) return;
        if (recordsInDisplay) return;
        refreshTextHighlightNeeded();
        setHighlightingToRecords();
        if (activeSlice && activeSlice.static) {
            let options: any = {};
            if (activeSlice.sliceType == Slice.STATIC_DEFAULT || activeSlice.sliceType == Slice.STATIC_OUTLIER) {
                options.offset = 0;
                options.limit = 20;
            }
            getRecordsByStaticSlice(projectId, activeSlice.id, options, (res) => {
                dispatch(setSearchRecordsExtended(postProcessRecordsExtended(res.data['recordsByStaticSlice'], labelingTasks)));
                staticDataSlicesCurrentCount(projectId, activeSlice.id, (res) => {
                    if (!res.data) {
                        dispatch(updateAdditionalDataState('staticDataSliceCurrentCount', null));
                        return;

                    }
                    dispatch(updateAdditionalDataState('staticDataSliceCurrentCount', res['data']['staticDataSlicesCurrentCount']));
                });
            });
        }
    }, [activeSlice, activeSearchParams, user, projectId, attributes, labelingTasks,]);

    useEffect(() => {
        if (!recordList) return;
        refreshTextHighlightNeeded();
        setHighlightingToRecords();
    }, [recordList]);

    useEffect(() => {
        if (!activeSlice || !labelingTasks || !fullSearchStore || !searchGroupsStore || !dataSlices) return;
        if (activeSlice.sliceType == Slice.STATIC_DEFAULT || activeSlice.sliceType == Slice.STATIC_OUTLIER) return;
        const findDataSLice = dataSlices.find((el) => el.id == activeSlice.id);
        if (!findDataSLice || additionalData.canUpdateDynamicSlice) return;
        const activeParams = updateSearchParameters(Object.values(JSON.parse(findDataSLice.filterRaw)), attributes, configuration.separator, jsonCopy(fullSearchStore), searchGroupsStore, labelingTasks);
        dispatch(setActiveSearchParams(activeParams));
        dispatch(setRecordsInDisplay(false));
        dispatch(updateAdditionalDataState('canUpdateDynamicSlice', true));
    }, [activeSlice, labelingTasks, searchGroupsStore, dataSlices]);

    useEffect(() => {
        if (!activeSlice) return;
        if (activeSlice.sliceType == Slice.STATIC_OUTLIER) {
            dispatch(updateAdditionalDataState('clearFullSearch', true));
            return;
        }
        const searchGroupsCopy = jsonCopy(searchGroupsStore);
        Object.keys(searchGroupsCopy).forEach((key) => {
            searchGroupsCopy[key].isOpen = false;
        });
        prepareNewFormGroups(activeSlice.filterRaw, searchGroupsCopy);
    }, [activeSlice, recordsInDisplay]);

    useEffect(() => {
        if (recordsInDisplay) {
            dispatch(updateAdditionalDataState('clearFullSearch', true));
            dispatch(setActiveSearchParams([]));
        }
    }, [recordsInDisplay]);

    useEffect(() => {
        if (!additionalData.clearFullSearch) return;
        if (!attributesSortOrder) return;
        dispatch(setFullSearchStore({}));
        dispatch(setSearchGroupsStore({}));
        prepareSearchGroups();
        dispatch(updateAdditionalDataState('clearFullSearch', false));
    }, [additionalData.clearFullSearch, attributesSortOrder]);

    useEffect(() => {
        if (!currentWeakSupervisionRun) return;
        if (currentWeakSupervisionRun.state == Status.NOT_YET_RUN) return;
        if (!currentWeakSupervisionRun.selectedInformationSources) return;
        setSelectedHeuristicsWS(currentWeakSupervisionRun.selectedInformationSources.split(','));
    }, [currentWeakSupervisionRun]);

    function prepareSearchGroups() {
        if (!attributes || !labelingTasks || !users) {
            console.log('preparation before data collected --> should not happen');
            return;
        }

        const fullSearchCopy = {};
        const searchGroupsCopy = {};
        const searchGroupsOrderCopy = [];

        // Category
        fullSearchCopy[SearchGroup.CATEGORY] = "SCALE";

        // Drill down
        fullSearchCopy[SearchGroup.DRILL_DOWN] = false;

        // Attributes
        const searchGroupAttributes = getBasicSearchGroup(SearchGroup.ATTRIBUTES, GROUP_SORT_ORDER + 100);
        fullSearchCopy[SearchGroup.ATTRIBUTES] = { groupElements: [] };
        searchGroupsCopy[SearchGroup.ATTRIBUTES] = searchGroupAttributes;
        for (let baseItem of getBasicGroupItems(searchGroupAttributes.group, searchGroupAttributes.key)) {
            fullSearchCopy[SearchGroup.ATTRIBUTES].groupElements.push(attributeCreateSearchGroup(baseItem, ++GLOBAL_SEARCH_GROUP_COUNT));
        }

        // Labeling Tasks
        let count = 0;
        for (let task of labelingTasks) {
            const searchGroupLabelingTasks = getBasicSearchGroup(SearchGroup.LABELING_TASKS, GROUP_SORT_ORDER + 300 + count, task.name, task.id);
            searchGroupsCopy[SearchGroup.LABELING_TASKS + '_' + task.id] = searchGroupLabelingTasks;
            fullSearchCopy[SearchGroup.LABELING_TASKS + '_' + task.id] = { groupElements: [] };
            for (let baseItem of getBasicGroupItems(searchGroupLabelingTasks.group, searchGroupLabelingTasks.key)) {
                fullSearchCopy[SearchGroup.LABELING_TASKS + '_' + task.id].groupElements = labelingTasksCreateSearchGroup(baseItem, task, ++GLOBAL_SEARCH_GROUP_COUNT);
            }
            count++;
        }

        // order by
        const searchGroupOrder = getBasicSearchGroup(SearchGroup.ORDER_STATEMENTS, GROUP_SORT_ORDER + 400);
        fullSearchCopy[SearchGroup.ORDER_STATEMENTS] = { groupElements: [] };
        searchGroupsCopy[SearchGroup.ORDER_STATEMENTS] = searchGroupOrder;
        for (let baseItem of getBasicGroupItems(searchGroupOrder.group, searchGroupOrder.key)) {
            fullSearchCopy[SearchGroup.ORDER_STATEMENTS].groupElements = orderByCreateSearchGroup(baseItem, ++GLOBAL_SEARCH_GROUP_COUNT, attributesSortOrder, attributesDict);
        }

        // comments
        const searchGroupComments = getBasicSearchGroup(SearchGroup.COMMENTS, GROUP_SORT_ORDER + 500);
        fullSearchCopy[SearchGroup.COMMENTS] = { groupElements: [] };
        searchGroupsCopy[SearchGroup.COMMENTS] = searchGroupComments;
        for (let baseItem of getBasicGroupItems(searchGroupComments.group, searchGroupComments.key)) {
            fullSearchCopy[SearchGroup.COMMENTS].groupElements = commentsCreateSearchGroup(baseItem, ++GLOBAL_SEARCH_GROUP_COUNT);
        }

        dispatch(setFullSearchStore(fullSearchCopy));
        dispatch(setSearchGroupsStore(searchGroupsCopy));

        for (let [key, value] of Object.entries(searchGroupsCopy)) {
            const findEl = searchGroupsOrderCopy.find(el => el.key == key);
            if (findEl == undefined) {
                searchGroupsOrderCopy.push({ order: (value as any).sortOrder, key: key });
            }
        }
        searchGroupsOrderCopy.sort((a, b) => a.order - b.order);
        setSearchGroupsOrder(searchGroupsOrderCopy);
    }

    function prepareNewFormGroups(filterRaw: any, searchGroupsCopy: any) {
        const parse = JSON.parse(filterRaw);
        const labelingTasksInSlice = Object.keys(parse).filter((el) => el.includes(SearchGroup.LABELING_TASKS));
        const tasksIds = labelingTasksInSlice.map((el) => el.split('_')[2]);
        const fullSearchStoreCopy = parse.hasOwnProperty(SearchGroup.CATEGORY) ? parse : jsonCopy(fullSearchStore);
        labelingTasks.forEach((task, index) => {
            const searchGroupLabelingTasks = getBasicSearchGroup(SearchGroup.LABELING_TASKS, GROUP_SORT_ORDER + 300 + index, task.name, task.id);
            if (!tasksIds.includes(task.id)) {
                fullSearchStoreCopy[SearchGroup.LABELING_TASKS + '_' + task.id] = { groupElements: [] };
                for (let baseItem of getBasicGroupItems(searchGroupLabelingTasks.group, searchGroupLabelingTasks.key)) {
                    fullSearchStoreCopy[SearchGroup.LABELING_TASKS + '_' + task.id].groupElements = labelingTasksCreateSearchGroup(baseItem, task, ++GLOBAL_SEARCH_GROUP_COUNT);
                }
            }
        });
        if (parse.hasOwnProperty(SearchGroup.CATEGORY)) {
            dispatch(setFullSearchStore(fullSearchStoreCopy));
            const openGroups = checkActiveGroups(parse, searchGroupsCopy);
            dispatch(setSearchGroupsStore(openGroups));
        } else {
            const prefilledValues = prefillActiveValues(parse, fullSearchStoreCopy);
            dispatch(setFullSearchStore(prefilledValues));
            const openGroups = checkActiveGroups(fullSearchStoreCopy, searchGroupsCopy);
            dispatch(setSearchGroupsStore(openGroups));
        }
    }

    function toggleGroupMenu(groupKey: any, forceValue: boolean = null) {
        const searchGroupsCopy = jsonCopy(searchGroupsStore);
        let group = searchGroupsCopy[groupKey];
        if (forceValue != null) group.isOpen = forceValue
        else group.isOpen = !group.isOpen;
        dispatch(setSearchGroupsStore(searchGroupsCopy));
    }

    function setActiveNegateGroup(groupItem, index, group, forceValue: boolean = null) {
        if (groupItem.disabled) return;
        const groupItemCopy = { ...groupItem };
        if (!groupItemCopy['active'])
            groupItemCopy['active'] = true;
        else if (groupItemCopy['active'] && !groupItemCopy['negate'])
            groupItemCopy['negate'] = true;
        else {
            groupItemCopy['negate'] = false;
            groupItemCopy['active'] = false;
        }
        groupItemCopy['color'] = getActiveNegateGroupColor(groupItemCopy);
        const fullSearchCopy = jsonCopy(fullSearchStore);
        if (forceValue) { // for the labeling tasks because of the different structure
            fullSearchCopy[group.key].groupElements['heuristics'][index] = groupItemCopy;
        } else if (group.key == SearchGroup.ORDER_STATEMENTS) {
            fullSearchCopy[group.key].groupElements['orderBy'][index] = groupItemCopy;
        } else if (group.key == SearchGroup.COMMENTS) {
            fullSearchCopy[group.key].groupElements['hasComments'] = groupItemCopy;
        } else {
            fullSearchCopy[group.key].groupElements[index] = groupItemCopy;
        }
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function getOperatorDropdownValues(i?: number, value?: any, fullSearchCopyParam?: any) {
        const operatorsCopy = [];
        const tooltipsCopy = [];
        const fullSearchCopy = fullSearchCopyParam ? jsonCopy(fullSearchCopyParam) : jsonCopy(fullSearchStore);
        const formControlsIdx = fullSearchCopy[SearchGroup.ATTRIBUTES].groupElements[i];
        let attributeType = getAttributeType(attributesSortOrder, value);
        if (!attributeType && value) {
            const attributeName = formControlsIdx['name'];
            attributeType = getAttributeType(attributesSortOrder, attributeName);
        }
        if (attributeType !== DataTypeEnum.BOOLEAN) {
            for (let t of Object.values(SearchOperator)) {
                operatorsCopy.push({
                    value: t.split("_").join(" "),
                });
                tooltipsCopy.push(getSearchOperatorTooltip(t));
            }
            if (formControlsIdx) {
                if (formControlsIdx['operator'] == '') {
                    formControlsIdx['operator'] = SearchOperator.CONTAINS;
                }
                formControlsIdx['addText'] = attributeType == DataTypeEnum.INTEGER ? 'Enter any number' : attributeType == DataTypeEnum.FLOAT ? 'Enter any float' : 'Enter any string';
            }
        } else {
            formControlsIdx['operator'] = '';
        }
        setOperatorsDropdown(operatorsCopy);
        setTooltipArray(tooltipsCopy);
        dispatch(setFullSearchStore(fullSearchCopy));
    }

    function removeSearchGroupItem(groupKey, index) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        fullSearchCopy[groupKey].groupElements.splice(index, 1);
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function addSearchGroupItem(groupItem, groupKey) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        let item = getBasicSearchItem(groupItem['type'], groupItem['groupKey']);
        fullSearchCopy[groupKey].groupElements.push(attributeCreateSearchGroup(item, ++GLOBAL_SEARCH_GROUP_COUNT));
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function selectValueDropdown(value: any, i: number, field: string, key: any) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        const formControlsIdx = fullSearchCopy[key].groupElements[i];
        formControlsIdx[field] = value;
        if (field == 'name') {
            const attributeType = getAttributeType(attributesSortOrder, value);
            setSaveAttributeType(attributeType);
            if (attributeType == DataTypeEnum.BOOLEAN && formControlsIdx['searchValue'] != "") {
                formControlsIdx['searchValue'] = "";
                formControlsIdx['searchValueBetween'] = "";
            } else if (attributeType == DataTypeEnum.INTEGER || attributeType == DataTypeEnum.FLOAT) {
                if (isNaN(parseInt(formControlsIdx['searchValue']))) {
                    formControlsIdx['searchValue'] = "";
                    formControlsIdx['searchValueBetween'] = "";
                }
            }
        }
        formControlsIdx['active'] = true;
        formControlsIdx['color'] = getActiveNegateGroupColor(formControlsIdx);
        dispatch(setFullSearchStore(fullSearchCopy));
        getOperatorDropdownValues(i, value, fullSearchCopy);
        updateSearchParams(fullSearchCopy);
        refreshTextHighlightNeeded();
        setHighlightingToRecords();
    }

    function checkIfDecimals(event: any, i: number, key: string) {
        const formControlsIdx = fullSearchStore[key].groupElements[i];
        const attributeType = getAttributeType(attributesSortOrder, formControlsIdx['name']);
        checkDecimalPatterns(attributeType, event, formControlsIdx['operator'], configuration.separator);
    }

    function updateLabelsFullSearch(label: any, groupKey: string, labelsKey: string) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        const labelsInTask = fullSearchCopy[groupKey].groupElements[labelsKey];
        const findLabel = labelsInTask.find((el) => el.id == label.id);
        findLabel.active = label.active;
        findLabel.negate = label.negate;
        fullSearchCopy[groupKey].groupElements[labelsKey] = labelsInTask;
        fullSearchCopy[groupKey].nameAdd = labelingTasks.find((el) => el.id == groupKey.split('_')[2]).name;
        fullSearchCopy[groupKey].groupElements.active = true;
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function changeConfidence(event: any, type: string, key: string, groupKey: string) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        const group = fullSearchCopy[key].groupElements[groupKey];
        let lower = group['lower'];
        let upper = group['upper'];
        if (lower < 0) lower = 0;
        if (upper > 100) upper = 100;
        if (upper <= 1) upper = 1;
        if (lower >= upper) lower = upper - 1;
        if (upper <= lower) upper = lower + 1;

        if (type == 'lower') {
            group['lower'] = event.target.value == '' ? 0 : parseInt(event.target.value);
        } else {
            group['upper'] = event.target.value == '' ? 0 : parseInt(event.target.value);
        }
        group['active'] = true;
        fullSearchCopy[key].nameAdd = labelingTasks.find((el) => el.id == key.split('_')[2]).name;
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function clearConfidence(groupKey: string, key: string) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        const group = fullSearchCopy[groupKey].groupElements[key];
        group['lower'] = 0;
        group['upper'] = 100;
        group['active'] = false;
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function updateIsDifferent(groupKey: string, group: any) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        fullSearchCopy[groupKey].groupElements['isWithDifferentResults'].active = !fullSearchCopy[groupKey].groupElements['isWithDifferentResults'].active
        fullSearchCopy[groupKey].groupElements['isWithDifferentResults'].color = getActiveNegateGroupColor(fullSearchCopy[groupKey].groupElements['isWithDifferentResults']);
        fullSearchCopy[groupKey].nameAdd = labelingTasks.find((el) => el.id == groupKey.split('_')[2]).name;
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function setSortFormControl(index, group) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        const formControlsIdx = fullSearchCopy[group.key].groupElements['orderBy'][index];
        const findActive = fullSearchCopy[group.key].groupElements['orderBy'].find((el) => el['active'] == true);
        const findRandom = fullSearchCopy[group.key].groupElements['orderBy'].find((el) => el['orderByKey'] == StaticOrderByKeys.RANDOM);
        if (findRandom) {
            findRandom['active'] = false;
            findRandom['color'] = getActiveNegateGroupColor(findRandom);
        }
        if (findActive && findActive != formControlsIdx) findActive['active'] = false;
        if (formControlsIdx['active'] && formControlsIdx['direction'] == -1) {
            formControlsIdx['direction'] = 1;
        } else if (formControlsIdx['active'] && formControlsIdx['direction'] == 1) {
            formControlsIdx['direction'] = -1;
            formControlsIdx['active'] = false;
        } else {
            formControlsIdx['active'] = true;
        }
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function updateRandomSeed() {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        const formControlsIdx = fullSearchCopy[SearchGroup.ORDER_STATEMENTS].groupElements['orderBy'].find((el) => el['orderByKey'] == StaticOrderByKeys.RANDOM);
        fullSearchCopy[SearchGroup.ORDER_STATEMENTS].groupElements['orderBy'].forEach((el) => {
            if (el['orderByKey'] != StaticOrderByKeys.RANDOM) el['active'] = false;
        });
        formControlsIdx['active'] = !formControlsIdx['active'];
        formControlsIdx['color'] = getActiveNegateGroupColor(formControlsIdx);
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function setRandomSeedGroup(value?: string) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        const formControlsIdx = fullSearchCopy[SearchGroup.ORDER_STATEMENTS].groupElements['orderBy'].find((el) => el['orderByKey'] == StaticOrderByKeys.RANDOM);
        formControlsIdx['seedString'] = value ?? generateRandomSeed();
        formControlsIdx['active'] = true;
        formControlsIdx['color'] = getActiveNegateGroupColor(formControlsIdx);
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function handleDrillDown(value: boolean) {
        const fullSearchCopy = jsonCopy(fullSearchStore);
        fullSearchCopy[SearchGroup.DRILL_DOWN] = value;
        dispatch(setFullSearchStore(fullSearchCopy));
        updateSearchParams(fullSearchCopy);
    }

    function updateSearchParams(fullSearchCopy) {
        const activeParams = updateSearchParameters(Object.values(fullSearchCopy), attributes, configuration.separator, jsonCopy(fullSearchCopy), searchGroupsStore);
        dispatch(setActiveSearchParams(activeParams));
        dispatch(updateAdditionalDataState('clearFullSearch', false));
        dispatch(setRecordsInDisplay(false));
        if (activeSlice && activeSlice.static) dispatch(updateAdditionalDataState('displayOutdatedWarning', true));
    }

    function setHighlightingToRecords() {
        let toSet = [];
        let filter;
        let textHighlightCopy = { ...textHighlight };
        for (let i = 1; i < attributesSortOrder.length; i++) {
            for (let searchElement of activeSearchParams) {
                if (searchElement.values.group == SearchGroup.ATTRIBUTES) {
                    if (
                        searchElement.values.name == 'Any Attribute' ||
                        searchElement.values.name == attributesDict[attributesSortOrder[i].key].name
                    ) {
                        if (typeof searchElement.values.searchValue != 'string') {
                            searchElement.values.searchValue = searchElement.values.searchValue.toString();
                        }
                        filter = getRegexFromFilter(searchElement);
                        if (filter) toSet.push(filter);
                    }
                }
            }
            textHighlightCopy[attributesSortOrder[i].key] = toSet;
        }
        dispatch(setTextHighlight(textHighlightCopy));
    }

    function refreshTextHighlightNeeded() {
        const isTextHighlightNeededCopy = { ...isTextHighlightNeeded };
        for (let i = 1; i < attributesSortOrder.length; i++) {
            const attributeKey = attributesSortOrder[i].key;
            for (let searchElement of activeSearchParams) {
                if (searchElement.values.group == SearchGroup.ATTRIBUTES) {
                    if (getRegexFromFilter(searchElement) == null) {
                        isTextHighlightNeededCopy[attributeKey] = false;

                    } else {
                        if (searchElement.values.name == 'Any Attribute' || searchElement.values.name == attributesDict[attributeKey].name) {
                            if ((searchElement.values.negate || searchElement.values.searchValue == '')) {
                                isTextHighlightNeededCopy[attributeKey] = false;
                            }
                            else isTextHighlightNeededCopy[attributeKey] = true;
                        }
                    }
                } else {
                    isTextHighlightNeededCopy[attributeKey] = false;
                }
            }
        }
        dispatch(setIsTextHighlightNeeded(isTextHighlightNeededCopy));
    }

    function refetchCurrentWeakSupervisionAndProcess() {
        getWeakSupervisionRun(projectId, res => {
            if (res == null) {
                setCurrentWeakSupervisionRun({ state: Status.NOT_YET_RUN });
            } else {
                setCurrentWeakSupervisionRun(postProcessCurrentWeakSupervisionRun(res['data']['currentWeakSupervisionRun']));
            }
        });
    }

    return (<>
        {searchGroupsStore && searchGroupsOrder.map((group) => (<div key={group.key} className="mt-4">
            <div onClick={() => toggleGroupMenu(group.key)}
                className={`flex flex-row items-center rounded-md hover:bg-gray-50 cursor-pointer`}>
                <div className={`w-7 ${searchGroupsStore[group.key].isOpen ? style.rotateTransform : null} ${style.transitionTransform}`}>
                    <ChevronDownIcon className="text-gray-700" />
                </div>
                <div className="flex flex-col">
                    <div className="font-semibold truncate" style={{ maxWidth: '20rem' }}>
                        {searchGroupsStore[group.key].name}
                        {searchGroupsStore[group.key].nameAdd != '' && <label className="font-normal ml-2">{searchGroupsStore[group.key].nameAdd}</label>}
                    </div>
                    <div className="text-xs text-gray-400 truncate" style={{ maxWidth: '20rem' }}>
                        {searchGroupsStore[group.key].subText}
                        {searchGroupsStore[group.key].nameAdd != '' && <label className="font-normal ml-1">{searchGroupsStore[group.key].nameAdd}</label>}
                    </div>
                </div>
            </div>
            <div className={`${style.transitionAll} ml-4`} style={{ maxHeight: searchGroupsStore[group.key].isOpen ? '1200px' : '0px', display: searchGroupsStore[group.key].isOpen ? 'block' : 'none' }}>
                <form>
                    {searchGroupsStore[group.key].group == SearchGroup.ATTRIBUTES && <div className="contents mx-2">
                        {fullSearchStore[group.key].groupElements.map((groupItem, index) => (<div key={groupItem.id}>
                            <div className="flex flex-row items-center rounded-md hover:bg-gray-50 my-2">
                                <div className="flex flex-col">
                                    <div onClick={() => setActiveNegateGroup(groupItem, index, group)} style={{ backgroundColor: groupItem.color, borderColor: groupItem.color }}
                                        className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                    </div>
                                    {fullSearchStore[group.key].groupElements.length > 1 &&
                                        <div onClick={() => removeSearchGroupItem(group.key, index)}
                                            className="mt-2 cursor-pointer flex justify-center hover:border-transparent hover:bg-transparent border-transparent bg-transparent px-0">
                                            <IconTrash className="text-gray-900 cursor-pointer h-4 w-4" />
                                        </div>}
                                </div>
                                <div className="flex-grow mr-2.5 flex flex-col  mt-2 ">
                                    <div className="flex-grow flex flex-row flex-wrap gap-1">
                                        <div style={{ width: groupItem.operator != '' ? '49%' : '100%' }}>
                                            <KernDropdown options={attributesSortOrder} buttonName={groupItem.name} backgroundColors={backgroundColors}
                                                selectedOption={(option: any) => selectValueDropdown(option.name, index, 'name', group.key)} fontClass="font-dmMono" buttonClasses="text-xs" />
                                        </div>
                                        <div style={{ width: '49%' }}>
                                            {groupItem.operator != '' &&
                                                <KernDropdown options={operatorsDropdown} buttonName={groupItem.operator} tooltipsArray={tooltipsArray} tooltipArrayPlacement="right" buttonClasses="text-xs"
                                                    selectedOption={(option: any) => selectValueDropdown(option.value, index, 'operator', group.key)} fontClass="font-dmMono" />
                                            }
                                        </div>
                                    </div>
                                    {uniqueValuesDict[groupItem['name']] && groupItem['operator'] != '' && groupItem['operator'] != 'BETWEEN' && groupItem['operator'] != 'IN' && groupItem['operator'] != 'IN WC' ? (
                                        <div className="my-2">
                                            <KernDropdown options={uniqueValuesDict[groupItem['name']]} buttonName={groupItem['searchValue'] ? groupItem['searchValue'] : 'Select value'}
                                                selectedOption={(option: any) => selectValueDropdown(option, index, 'searchValue', group.key)} fontClass="font-dmMono" />
                                        </div>
                                    ) : (
                                        <div className="my-2 flex-grow flex flex-row items-center">
                                            {groupItem['operator'] != '' && <input placeholder={groupItem['addText']} value={groupItem['searchValue']}
                                                onChange={(e) => selectValueDropdown(e.target.value, index, 'searchValue', group.key)}
                                                onKeyDown={(e) => checkIfDecimals(e, index, group.key)}
                                                className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}
                                            {groupItem['operator'] == SearchOperator.BETWEEN && <span className="text-sm text-gray-500 mx-1">AND</span>}
                                            {groupItem['operator'] == SearchOperator.BETWEEN && <input placeholder={groupItem['addText']} value={groupItem['searchValueBetween']}
                                                onChange={(e) => selectValueDropdown(e.target.value, index, 'searchValueBetween', group.key)}
                                                onKeyDown={(e) => checkIfDecimals(e, index, group.key)}
                                                className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}
                                        </div>
                                    )}

                                    {(groupItem['operator'] == "BEGINS WITH" || groupItem['operator'] == "ENDS WITH" || groupItem['operator'] == SearchOperator.CONTAINS || groupItem['operator'] == "IN WC") && (saveAttributeType != DataTypeEnum.INTEGER && saveAttributeType != DataTypeEnum.FLOAT) &&
                                        <label htmlFor="caseSensitive" className="text-xs text-gray-500 cursor-pointer flex items-center pb-2">
                                            <input name="caseSensitive" className="mr-1 cursor-pointer" id="caseSensitive"
                                                onChange={(e: any) => selectValueDropdown(e.target.checked, index, 'caseSensitive', group.key)} type="checkbox" />Case sensitive</label>}
                                </div>
                            </div>
                            <div className="w-full flex justify-center">
                                {index == fullSearchStore[group.key].groupElements.length - 1 &&
                                    <span onClick={() => addSearchGroupItem(groupItem, group.key)}
                                        className="bg-gray-100 text-gray-800 cursor-pointer p-1 rounded-md hover:bg-gray-300">
                                        <IconPlus className="cursor-pointer" />
                                    </span>}
                            </div>
                        </div>))}
                    </div>}
                    {searchGroupsStore[group.key].group == SearchGroup.LABELING_TASKS && <div className="flex flex-row items-center mt-4">
                        {fullSearchStore[group.key] && <div className="flex-grow flex flex-col">
                            <div>Manually labeled</div>
                            {fullSearchStore[group.key].groupElements['manualLabels'] && fullSearchStore[group.key].groupElements['manualLabels'].length == 0 ? (<ButtonLabelsDisabled />) : (
                                <KernDropdown options={fullSearchStore[group.key].groupElements['manualLabels'] ?? []} buttonName={manualLabels.length == 0 ? 'None selected' : manualLabels.join(', ')} hasCheckboxesThreeStates={true} keepDrownOpen={true}
                                    dropdownWidth="w-80" selectedOption={(option: any) => {
                                        const labels = [...manualLabels, option.name]
                                        setManualLabels(labels);
                                        updateLabelsFullSearch(option, group.key, 'manualLabels');
                                    }} />
                            )}

                            <div className="mt-2">Weakly supervised</div>
                            {fullSearchStore[group.key].groupElements['weakSupervisionLabels'] && fullSearchStore[group.key].groupElements['weakSupervisionLabels'].length == 0 ? (<ButtonLabelsDisabled />) : (
                                <KernDropdown options={fullSearchStore[group.key].groupElements['weakSupervisionLabels'] ?? []} buttonName={weakSupervisionLabels.length == 0 ? 'None selected' : weakSupervisionLabels.join(', ')} hasCheckboxesThreeStates={true}
                                    dropdownWidth="w-80" selectedOption={(option: any) => {
                                        const labels = [...weakSupervisionLabels, option.name]
                                        setWeakSupervisionLabels(labels);
                                        updateLabelsFullSearch(option, group.key, 'weakSupervisionLabels');
                                    }} />
                            )}
                            <div className="flex-grow min-w-0 mt-1">
                                <div className="flex flex-row items-center whitespace-nowrap">
                                    <span className="text-sm mr-0.5 font-dmMono">CONFIDENCE BETWEEN</span>
                                    <input disabled={fullSearchStore[group.key].groupElements['weakSupervisionLabels'].length == 0}
                                        onChange={(e) => changeConfidence(e, 'lower', group.key, 'weakSupervisionConfidence')}
                                        value={fullSearchStore[group.key].groupElements['weakSupervisionConfidence'] ? fullSearchStore[group.key].groupElements['weakSupervisionConfidence']['lower'] : 0}
                                        className="h-8 w-11 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" />
                                    <span className="text-sm mx-0.5 font-dmMono">% AND</span>
                                    <input disabled={fullSearchStore[group.key].groupElements['weakSupervisionLabels'].length == 0}
                                        onChange={(e) => changeConfidence(e, 'upper', group.key, 'weakSupervisionConfidence')}
                                        value={fullSearchStore[group.key].groupElements['weakSupervisionConfidence'] ? fullSearchStore[group.key].groupElements['weakSupervisionConfidence']['upper'] : 100}
                                        className="h-8 w-11 text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" />
                                    <span className="text-sm mx-0.5 font-dmMono">%</span>
                                    {fullSearchStore[group.key].groupElements['weakSupervisionConfidence'] && fullSearchStore[group.key].groupElements['weakSupervisionConfidence']['active'] && <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.CLEAR_WS_CONFIDENCE} color="invert">
                                        <IconFilterOff className="text-red-700 cursor-pointer" onClick={() => clearConfidence(group.key, 'weakSupervisionConfidence')} />
                                    </Tooltip>}
                                </div>
                            </div>

                            <div className="mt-2 font-semibold">Heuristics</div>
                            {fullSearchStore[group.key].groupElements['heuristics'] && fullSearchStore[group.key].groupElements['heuristics'].length == 0 ? (<div className="text-sm text-gray-400">No heuristics associated with this task</div>) : (<div className="flex flex-col">
                                <div className="flex items-center cursor-pointer border-t border-t-gray-300 border-b border-b-gray-300" onClick={() => updateIsDifferent(group.key, fullSearchStore[group.key].groupElements['isWithDifferentResults'])}>
                                    <div style={{ backgroundColor: fullSearchStore[group.key].groupElements['isWithDifferentResults']?.color, borderColor: fullSearchStore[group.key].groupElements['isWithDifferentResults']?.color }}
                                        className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                    </div>
                                    <span className="text-sm truncate w-full pl-2">Only with different results</span>
                                </div>
                                {fullSearchStore[group.key].groupElements['heuristics'] && fullSearchStore[group.key].groupElements['heuristics'].map((groupItem, index) => (<div key={groupItem.id} className="my-1" >
                                    <div className="flex flex-row items-center cursor-pointer" onClick={() => setActiveNegateGroup(groupItem, index, group, true)}>
                                        <div style={{ backgroundColor: groupItem.color, borderColor: groupItem.color }}
                                            className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                        </div>
                                        <span className="text-sm truncate w-full pl-2">{groupItem['name']}</span>
                                    </div>
                                </div>))}
                            </div>)}
                        </div>}
                    </div>}
                    {searchGroupsStore[group.key].group == SearchGroup.ORDER_STATEMENTS && <div className="mt-4">
                        {fullSearchStore[group.key].groupElements['orderBy'] && fullSearchStore[group.key].groupElements['orderBy'].map((groupItem, index) => (<div key={groupItem.id}>
                            <div className="form-control class mb-2">
                                {groupItem['orderByKey'] != StaticOrderByKeys.RANDOM ? (<div className="mb-2 flex items-center">
                                    <div className="flex items-center cursor-pointer" onClick={() => setSortFormControl(index, group)}>
                                        <div className={`p-0 cursor-pointer ${groupItem['direction'] == 1 ? style.rotateTransform : null}`}>
                                            <div className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer flex justify-center items-center hover:bg-gray-200">
                                                {groupItem['active'] != 0 && <IconArrowDown className="text-gray-500 h-3 w-3" />}
                                            </div>
                                        </div>
                                        <span className="ml-2 text-sm truncate w-full">{groupItem['displayName']}</span>
                                    </div>
                                </div>) : (<div className="flex flex-row items-center mr-2">
                                    <div className="flex flex-row items-center cursor-pointer" onClick={updateRandomSeed}>
                                        <div style={{ backgroundColor: groupItem.color, borderColor: groupItem.color }}
                                            className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                        </div>
                                        <span className="text-sm truncate pl-2">{groupItem['displayName']}</span>
                                    </div>

                                    <div className="flex rounded-md shadow-sm">
                                        <span className="ml-2 inline-flex items-center px-2.5 text-sm rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            Seed
                                            <div className="ml-2 cursor-pointer" onClick={() => setRandomSeedGroup()}>
                                                <IconArrowsRandom />
                                            </div>
                                        </span>
                                        <input value={groupItem['seedString']}
                                            onChange={(e) => setRandomSeedGroup(e.target.value)}
                                            className="h-8 w-36 text-sm border-gray-300 rounded-r-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                                    </div>
                                </div>)}
                            </div>
                        </div>))}
                    </div>}
                    {fullSearchStore[group.key] && searchGroupsStore[group.key].group == SearchGroup.COMMENTS && <div className="flex flex-row items-center mt-4">
                        <div className="flex-grow flex items-center">
                            <div className="flex flex-col">
                                <div className="my-1">
                                    {fullSearchStore[group.key].groupElements['hasComments'] && <div className="form-control flex flex-row flex-nowrap items-center">
                                        <div className="flex flex-row items-center cursor-pointer" onClick={() => setActiveNegateGroup(fullSearchStore[group.key].groupElements['hasComments'], null, group)} >
                                            <div style={{ backgroundColor: fullSearchStore[group.key].groupElements['hasComments'].color, borderColor: fullSearchStore[group.key].groupElements['hasComments'].color }}
                                                className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                            </div>
                                            <span className="ml-2 text-sm truncate">Record with comments</span>
                                        </div>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>}

                    {(searchGroupsStore[group.key].group != SearchGroup.ATTRIBUTES && searchGroupsStore[group.key].group != SearchGroup.LABELING_TASKS && searchGroupsStore[group.key].group != SearchGroup.ORDER_STATEMENTS && searchGroupsStore[group.key].group != SearchGroup.COMMENTS) && <p>{'Default :('}</p>}
                </form>
            </div>
        </div >))
        }
        <div className="mt-4 grid items-center" style={{ gridTemplateColumns: 'max-content max-content max-content max-content max-content' }}>
            {fullSearchStore && <div className="flex flex-row items-center">
                <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.CONNECT} color="invert" placement="right" className="cursor-auto">
                    <div className="cursor-help mr-2 underline filtersUnderline">
                        Connect by
                    </div>
                </Tooltip>
                <div className="flex items-center">
                    <input type="radio" id="radio-drill-down-inactive" name="radio-drill-down-inactive"
                        onChange={() => handleDrillDown(false)} checked={!fullSearchStore[SearchGroup.DRILL_DOWN]}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-200" />
                    <label htmlFor="radio-drill-down-inactive" className="cursor-pointer label p-1 text-sm pr-2 font-dmMono">
                        OR
                    </label>
                </div>
                <div className="flex items-center mr-3">
                    <input type="radio" id="radio-drill-down-active" name="radio-drill-down-active"
                        onChange={() => handleDrillDown(true)} checked={fullSearchStore[SearchGroup.DRILL_DOWN]}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-200" />
                    <label htmlFor="radio-drill-down-active" className="cursor-pointer label p-1 text-sm pr-2 font-dmMono">
                        AND
                    </label>
                </div>
            </div>}
        </div >
        <DataSliceOperations fullSearch={fullSearchStore} />
    </>)
}

function ButtonLabelsDisabled() {
    return (<button disabled={true} className="cursor-not-allowed inline-flex rounded-md border border-gray-300 w-80 shadow-sm px-4 py-1.5 items-center bg-white text-xs font-semibold text-gray-700 focus:ring-offset-2 focus:ring-offset-gray-400" >
        <div className="truncate min-w-0 mr-4">
            No labels associated with this task
        </div>
        <IconPointerOff className="h-5 w-5 text-gray-400" />
    </button>)
}