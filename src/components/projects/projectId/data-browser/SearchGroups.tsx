import { selectAttributes, selectAttributesDict, selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { attributeCreateSearchGroup, commentsCreateSearchGroup, generateRandomSeed, getBasicGroupItems, getBasicSearchGroup, getBasicSearchItem, labelingTasksCreateSearchGroup, orderByCreateSearchGroup, userCreateSearchGroup } from "@/src/util/components/projects/projectId/data-browser/search-groups-helper";
import { SearchGroup, StaticOrderByKeys } from "@/submodules/javascript-functions/enums/enums";
import { IconArrowBadgeDown, IconArrowUp, IconArrowsRandom, IconFilterOff, IconInfoCircle, IconPlus, IconPointerOff, IconTrash } from "@tabler/icons-react";
import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/data-browser.module.css';
import { timer } from "rxjs";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { checkDecimalPatterns, getAttributeType, getSearchOperatorTooltip } from "@/src/util/components/projects/projectId/data-browser/search-operators-helper";
import { DataTypeEnum } from "@/src/types/shared/general";
import { selectAllUsers, selectUser } from "@/src/reduxStore/states/general";
import { selectActiveSearchParams, selectActiveSlice, selectConfiguration, selectIsTextHighlightNeeded, selectRecords, selectTextHighlight, selectUsersCount, setActiveSearchParams, setIsTextHighlightNeeded, setSearchRecordsExtended, setTextHighlight } from "@/src/reduxStore/states/pages/data-browser";
import { Tooltip } from "@nextui-org/react";
import { setModalStates } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { DataSliceOperations } from "./DataSliceOperations";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_RECORDS_EXTENDED } from "@/src/services/gql/queries/data-browser";
import { postProcessRecordsExtended } from "@/src/util/components/projects/projectId/data-browser/data-browser-helper";
import { parseFilterToExtended } from "@/src/util/components/projects/projectId/data-browser/filter-parser-helper";
import { getRegexFromFilter, updateSearchParameters } from "@/src/util/components/projects/projectId/data-browser/search-parameters";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import UserInfoModal from "./modals/UserInfoModal";
import { getColorForDataType } from "@/src/util/components/projects/projectId/settings/data-schema-helper";

const GROUP_SORT_ORDER = 0;
let GLOBAL_SEARCH_GROUP_COUNT = 0;

export default function SearchGroups() {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);
    const labelingTasks = useSelector(selectLabelingTasksAll);
    const users = useSelector(selectAllUsers);
    const usersMap = useSelector(selectUsersCount);
    const attributesDict = useSelector(selectAttributesDict);
    const activeSearchParams = useSelector(selectActiveSearchParams);
    const configuration = useSelector(selectConfiguration);
    const user = useSelector(selectUser);
    const activeSlice = useSelector(selectActiveSlice);
    const textHighlight = useSelector(selectTextHighlight);
    const isTextHighlightNeeded = useSelector(selectIsTextHighlightNeeded);

    const [fullSearch, setFullSearch] = useState<any>({});
    const [searchGroups, setSearchGroups] = useState<{ [key: string]: any }>({});
    const [searchGroupsOrder, setSearchGroupsOrder] = useState<{ order: number; key: string }[]>([]);
    const [attributesSortOrder, setAttributeSortOrder] = useState([]);
    const [operatorsDropdown, setOperatorsDropdown] = useState([]);
    const [tooltipsArray, setTooltipArray] = useState([]);
    const [saveDropdownAttribute, setSaveDropdownAttribute] = useState(null);
    const [saveAttributeType, setSaveAttributeType] = useState(null);
    const [manualLabels, setManualLabels] = useState([]);
    const [weakSupervisionLabels, setWeakSupervisionLabels] = useState([]);
    const [modelCallBacksLabels, setModelCallBacksLabels] = useState([]);
    const [backgroundColors, setBackgroundColors] = useState<string[]>([]);

    const [refetchExtendedRecord] = useLazyQuery(SEARCH_RECORDS_EXTENDED, { fetchPolicy: "no-cache" });

    useEffect(() => {
        if (!project) return;
        if (!users) return;
        if (!labelingTasks) return;
        prepareSearchGroups();
    }, [project, users, labelingTasks]);

    useEffect(() => {
        if (!attributes) return;
        const attributesSort = [];
        const colors = [];
        attributesSort.push({

            name: 'Any Attribute',
            key: null,
            order: 0,
            type: 'TEXT'
        });
        colors.push('gray');
        attributes.forEach((att) => {
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
        if (!attributesSortOrder) return;
        if (!fullSearch || !fullSearch[SearchGroup.ATTRIBUTES]) return;
        getOperatorDropdownValues();
    }, [searchGroups, attributesSortOrder]);

    useEffect(() => {
        if (!user) return;
        if (!activeSearchParams) return;
        if (!labelingTasks) return;
        refreshTextHighlightNeeded();
        setHighlightingToRecords();
        refetchExtendedRecord({
            variables: {
                projectId: project.id,
                filterData: parseFilterToExtended(activeSearchParams, attributes, configuration, labelingTasks, user),
                offset: 0, limit: 20
            }
        }).then((res) => {
            dispatch(setSearchRecordsExtended(postProcessRecordsExtended(res.data['searchRecordsExtended'], labelingTasks)));
        });
    }, [activeSearchParams, user, project, attributes, labelingTasks, configuration, activeSlice]);

    useEffect(() => {
        if (!activeSlice) return;
        const activeParams = updateSearchParameters(Object.values(JSON.parse(activeSlice.filterRaw)), attributes, configuration.separator, fullSearch);
        dispatch(setActiveSearchParams(activeParams));
    }, [activeSlice]);

    function prepareSearchGroups() {
        if (!attributes || !labelingTasks || !users) {
            console.log('preparation before data collected --> should not happen');
            return;
        }
        setSearchGroupsOrder([]);
        setSearchGroups({});
        setFullSearch({});

        const fullSearchCopy = { ...fullSearch }
        const searchGroupsCopy = { ...searchGroups };
        const searchGroupsOrderCopy = [...searchGroupsOrder];

        // Drill down
        fullSearch[SearchGroup.DRILL_DOWN] = { value: false, groupElements: [] };

        // Attributes
        const searchGroupAttributes = getBasicSearchGroup(SearchGroup.ATTRIBUTES, GROUP_SORT_ORDER + 100);
        fullSearchCopy[SearchGroup.ATTRIBUTES] = { value: searchGroupAttributes, groupElements: [] };
        searchGroupsCopy[SearchGroup.ATTRIBUTES] = searchGroupAttributes;
        for (let baseItem of getBasicGroupItems(searchGroupAttributes.group, searchGroupAttributes.key)) {
            fullSearchCopy[SearchGroup.ATTRIBUTES].groupElements.push(attributeCreateSearchGroup(baseItem, ++GLOBAL_SEARCH_GROUP_COUNT));
        }

        // User Filter
        const searchGroupUserFilter = getBasicSearchGroup(SearchGroup.USER_FILTER, GROUP_SORT_ORDER + 200);
        fullSearchCopy[SearchGroup.USER_FILTER] = { value: searchGroupUserFilter, groupElements: [] };
        searchGroupsCopy[SearchGroup.USER_FILTER] = searchGroupUserFilter;
        for (let baseItem of getBasicGroupItems(searchGroupUserFilter.group, searchGroupUserFilter.key)) {
            fullSearchCopy[SearchGroup.USER_FILTER].groupElements = userCreateSearchGroup(baseItem, ++GLOBAL_SEARCH_GROUP_COUNT, users);
        }

        // Labeling Tasks
        let count = 0;
        for (let task of labelingTasks) {
            const searchGroupLabelingTasks = getBasicSearchGroup(SearchGroup.LABELING_TASKS, GROUP_SORT_ORDER + 300 + count, task.name, task.id);
            searchGroupsCopy[SearchGroup.LABELING_TASKS + '_' + task.id] = searchGroupLabelingTasks;
            fullSearchCopy[SearchGroup.LABELING_TASKS + '_' + task.id] = { value: searchGroupLabelingTasks, groupElements: [] };
            for (let baseItem of getBasicGroupItems(searchGroupLabelingTasks.group, searchGroupLabelingTasks.key)) {
                fullSearchCopy[SearchGroup.LABELING_TASKS + '_' + task.id].groupElements = labelingTasksCreateSearchGroup(baseItem, task, ++GLOBAL_SEARCH_GROUP_COUNT);
            }
            count++;
        }

        // order by
        const searchGroupOrder = getBasicSearchGroup(SearchGroup.ORDER_STATEMENTS, GROUP_SORT_ORDER + 400);
        fullSearchCopy[SearchGroup.ORDER_STATEMENTS] = { value: searchGroupOrder, groupElements: [] };
        searchGroupsCopy[SearchGroup.ORDER_STATEMENTS] = searchGroupOrder;
        for (let baseItem of getBasicGroupItems(searchGroupUserFilter.group, searchGroupUserFilter.key)) {
            fullSearchCopy[SearchGroup.ORDER_STATEMENTS].groupElements = orderByCreateSearchGroup(baseItem, ++GLOBAL_SEARCH_GROUP_COUNT, attributesSortOrder, attributesDict);
        }

        // comments
        const searchGroupComments = getBasicSearchGroup(SearchGroup.COMMENTS, GROUP_SORT_ORDER + 500);
        fullSearchCopy[SearchGroup.COMMENTS] = { value: searchGroupComments, groupElements: [] };
        searchGroupsCopy[SearchGroup.COMMENTS] = searchGroupComments;
        for (let baseItem of getBasicGroupItems(searchGroupComments.group, searchGroupComments.key)) {
            fullSearchCopy[SearchGroup.COMMENTS].groupElements = commentsCreateSearchGroup(baseItem, ++GLOBAL_SEARCH_GROUP_COUNT);
        }

        setSearchGroups(searchGroupsCopy);
        setFullSearch(fullSearchCopy);

        for (let [key, value] of Object.entries(searchGroupsCopy)) {
            const findEl = searchGroupsOrderCopy.find(el => el.key == key);
            if (findEl == undefined) {
                searchGroupsOrderCopy.push({ order: value.sortOrder, key: key });
            }
        }
        searchGroupsOrderCopy.sort((a, b) => a.order - b.order);
        setSearchGroupsOrder(searchGroupsOrderCopy);
    }

    function toggleGroupMenu(groupKey: any, forceValue: boolean = null) {
        const searchGroupsCopy = { ...searchGroups };
        let group = searchGroupsCopy[groupKey];
        if (forceValue != null) group.isOpen = forceValue
        else group.isOpen = !group.isOpen;

        group.inOpenTransition = true;
        timer(250).subscribe(() => (group.inOpenTransition = false));
        setSearchGroups(searchGroupsCopy)
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
        const fullSearchCopy = jsonCopy(fullSearch);
        if (group.key == SearchGroup.USER_FILTER) {
            fullSearchCopy[group.key].groupElements['users'][index] = groupItemCopy;
        } else if (forceValue) { // for the labeling tasks because of the different structure
            fullSearchCopy[group.key].groupElements['heuristics'][index] = groupItemCopy;
        } else if (group.key == SearchGroup.ORDER_STATEMENTS) {
            fullSearchCopy[group.key].groupElements['orderBy'][index] = groupItemCopy;
        } else if (group.key == SearchGroup.COMMENTS) {
            fullSearchCopy[group.key].groupElements['hasComments'] = groupItemCopy;
        } else {
            fullSearchCopy[group.key].groupElements[index] = groupItemCopy;
        }
        setFullSearch(fullSearchCopy);
        updateSearchParams(fullSearchCopy);
    }

    function getActiveNegateGroupColor(group) {
        if (!group['active']) return null;
        if (group['negate']) return '#ef4444'
        return '#2563eb';
    }

    function getOperatorDropdownValues(i?: number, value?: any) {
        if (operatorsDropdown.length == 0) {
            const operatorsCopy = [...operatorsDropdown];
            const tooltipsCopy = [...tooltipsArray];
            const fullSearchCopy = { ...fullSearch };
            const formControlsIdx = fullSearchCopy[SearchGroup.ATTRIBUTES].groupElements[i];
            const attributeType = getAttributeType(attributesSortOrder, saveDropdownAttribute);
            if (attributeType !== 'BOOLEAN') {
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
                    formControlsIdx['addText'] = attributeType == 'INTEGER' ? 'Enter any number' : attributeType == 'FLOAT' ? 'Enter any float' : 'Enter any string';
                }
            } else {
                formControlsIdx['operator'] = '';
            }
            setOperatorsDropdown(operatorsCopy);
            setTooltipArray(tooltipsCopy);
            setFullSearch(fullSearchCopy);
        }
    }

    function removeSearchGroupItem(groupKey, index) {
        const fullSearchCopy = { ...fullSearch };
        fullSearchCopy[groupKey].groupElements.splice(index, 1);
        setFullSearch(fullSearchCopy);
    }

    function addSearchGroupItem(groupItem, groupKey) {
        const fullSearchCopy = { ...fullSearch };
        let item = getBasicSearchItem(groupItem['type'], groupItem['groupKey']);
        fullSearchCopy[groupKey].groupElements.push(attributeCreateSearchGroup(item, ++GLOBAL_SEARCH_GROUP_COUNT));
        setFullSearch(fullSearchCopy);
    }

    function selectValueDropdown(value: string, i: number, field: string, key: any) {
        const fullSearchCopy = jsonCopy(fullSearch);
        const formControlsIdx = fullSearchCopy[key].groupElements[i];
        formControlsIdx[field] = value;
        if (field == 'name') {
            const attributeType = getAttributeType(attributesSortOrder, value);
            setSaveDropdownAttribute(value);
            setSaveAttributeType(attributeType);
            if (attributeType == "BOOLEAN" && formControlsIdx['searchValue'] != "") {
                formControlsIdx['searchValue'] = "";
                formControlsIdx['searchValueBetween'] = "";
            } else if (attributeType == 'INTEGER' || attributeType == 'FLOAT') {
                if (isNaN(parseInt(formControlsIdx['searchValue']))) {
                    formControlsIdx['searchValue'] = "";
                    formControlsIdx['searchValueBetween'] = "";
                }
            }
        }
        setFullSearch(fullSearchCopy);
        getOperatorDropdownValues(i, value);
        updateSearchParams(fullSearchCopy);
    }

    function checkIfDecimals(event: any, i: number, key: string) {
        const formControlsIdx = fullSearch[key].groupElements[i];
        const attributeType = getAttributeType(attributesSortOrder, formControlsIdx['name']);
        checkDecimalPatterns(attributeType, event, formControlsIdx['operator'], '-');
    }

    function updateLabelsFullSearch(labels: string[], groupKey: string, labelsKey: string) {
        const fullSearchCopy = { ...fullSearch };
        for (let label of labels) {
            const labelsInTask = fullSearchCopy[groupKey].groupElements[labelsKey];
            const findLabel = labelsInTask.find((el) => el.name == label);
            findLabel.active = !findLabel.active;
        }
        setFullSearch(fullSearchCopy);
    }

    function changeConfidence(event: any, type: string, key: string, groupKey: string) {
        const fullSearchCopy = { ...fullSearch };
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
        group['active'] = !group['active'];
        setFullSearch(fullSearchCopy);
    }

    function clearConfidence(group) {
        const fullSearchCopy = { ...fullSearch };
        group['lower'] = 0;
        group['upper'] = 100;
        group['active'] = false;
        setFullSearch(fullSearchCopy);
    }

    function updateIsDifferent(groupKey: string, group: any) {
        const fullSearchCopy = { ...fullSearch };
        fullSearchCopy[groupKey].groupElements['isWithDifferentResults'].active = !fullSearchCopy[groupKey].groupElements['isWithDifferentResults'].active
        fullSearchCopy[groupKey].groupElements['isWithDifferentResults'].color = getActiveNegateGroupColor(fullSearchCopy[groupKey].groupElements['isWithDifferentResults']);
        setFullSearch(fullSearchCopy);
    }

    function setSortFormControl(index, group) {
        const fullSearchCopy = { ...fullSearch };
        const formControlsIdx = fullSearchCopy[group.key].groupElements['orderBy'][index];
        if (formControlsIdx['active'] && formControlsIdx['direction'] == -1) {
            formControlsIdx['direction'] = 1;
        } else if (formControlsIdx['active'] && formControlsIdx['direction'] == 1) {
            formControlsIdx['direction'] = -1;
            formControlsIdx['active'] = false;
        } else {
            formControlsIdx['active'] = true;
        }
        setFullSearch(fullSearchCopy);
    }

    function setRandomSeedGroup(value?: string) {
        const fullSearchCopy = { ...fullSearch };
        const formControlsIdx = fullSearchCopy[SearchGroup.ORDER_STATEMENTS].groupElements['orderBy'].find((el) => el['orderByKey'] == StaticOrderByKeys.RANDOM);
        formControlsIdx['seedString'] = value ?? generateRandomSeed();
        setFullSearch(fullSearchCopy);
    }

    function handleDrillDown(value: boolean) {
        const fullSearchCopy = { ...fullSearch };
        fullSearchCopy[SearchGroup.DRILL_DOWN].value = value;
        setFullSearch(fullSearchCopy);
    }

    function updateSearchParams(fullSearchCopy) {
        const activeParams = updateSearchParameters(Object.values(fullSearchCopy), attributes, configuration.separator, fullSearchCopy);
        dispatch(setActiveSearchParams(activeParams));
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
                    if (searchElement.values.name == 'Any Attribute' || searchElement.values.name == attributesDict[attributeKey].name) {
                        if (searchElement.values.negate) isTextHighlightNeededCopy[attributeKey] = false;
                        else isTextHighlightNeededCopy[attributeKey] = true;
                    }
                } else {
                    isTextHighlightNeededCopy[attributeKey] = false;
                }
            }
        }
        dispatch(setIsTextHighlightNeeded(isTextHighlightNeededCopy));
    }

    return (<>
        {searchGroups && searchGroupsOrder.map((group) => (<div key={group.key} className="mt-4">
            <div onClick={() => toggleGroupMenu(group.key)}
                className={`flex flex-row items-center ${style.transitionTransform} rounded-md hover:bg-gray-50 cursor-pointer`}>
                <div className={`w-7 ${searchGroups[group.key].isOpen ? style.rotateTransform : null}`}>
                    <IconArrowBadgeDown size={24} stroke={1.5} className="text-gray-700" />
                </div>
                <div className="flex flex-col">
                    <div className="font-bold truncate" style={{ maxWidth: '21rem' }}>
                        {searchGroups[group.key].name}
                        {searchGroups[group.key].nameAdd != '' && <label className="font-normal ml-2">{searchGroups[group.key].nameAdd}</label>}
                    </div>
                    <div className="text-xs text-gray-400 truncate" style={{ maxWidth: '21rem' }}>
                        {searchGroups[group.key].subText}
                        {searchGroups[group.key].nameAdd != '' && <label className="font-normal ml-1">{searchGroups[group.key].nameAdd}</label>}
                    </div>
                </div>
            </div>
            <div className={`${style.transitionAll} ml-4`} style={{ maxHeight: searchGroups[group.key].isOpen ? '500px' : '0px', display: searchGroups[group.key].isOpen ? 'block' : 'none' }}>
                <form>
                    {fullSearch[group.key].value.group == SearchGroup.ATTRIBUTES && <div className="contents mx-2">
                        {fullSearch[group.key].groupElements.map((groupItem, index) => (<div key={index}>
                            <div className="flex flex-row items-center rounded-md hover:bg-gray-50 my-2">
                                <div className="flex flex-col">
                                    <div onClick={() => setActiveNegateGroup(groupItem, index, group)} style={{ backgroundColor: groupItem.color, borderColor: groupItem.color }}
                                        className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                    </div>
                                    {fullSearch[group.key].groupElements.length > 1 &&
                                        <div onClick={() => removeSearchGroupItem(group.key, index)}
                                            className="mt-2 cursor-pointer flex justify-center hover:border-transparent hover:bg-transparent border-transparent bg-transparent px-0">
                                            <IconTrash className="text-gray-900 cursor-pointer h-4 w-4" />
                                        </div>}
                                </div>
                                <div className="flex-grow mr-2.5 flex flex-col  mt-2 ">
                                    <div className="flex-grow flex flex-row flex-wrap gap-1">
                                        <div style={{ width: groupItem.operator != '' ? '49%' : '100%' }}>
                                            <Dropdown options={attributesSortOrder} buttonName={groupItem.name} backgroundColors={backgroundColors}
                                                selectedOption={(option: string) => selectValueDropdown(option, index, 'name', group.key)} />
                                        </div>
                                        <div style={{ width: '49%' }}>
                                            {groupItem.operator != '' && <Dropdown options={operatorsDropdown} buttonName={groupItem.operator} tooltipsArray={tooltipsArray} tooltipArrayPlacement="right"
                                                selectedOption={(option: string) => selectValueDropdown(option, index, 'operator', group.key)} />}
                                        </div>
                                    </div>
                                    {/* TODO: Add check for unique values */}
                                    <div className="my-2 flex-grow flex flex-row items-center">
                                        {groupItem['operator'] != '' && <input placeholder={groupItem['addText']}
                                            onChange={(e) => selectValueDropdown(e.target.value, index, 'searchValue', group.key)}
                                            onKeyDown={(e) => checkIfDecimals(e, index, group.key)}
                                            className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}
                                        {groupItem['operator'] == SearchOperator.BETWEEN && <span className="text-sm text-gray-500 mx-1">AND</span>}
                                        {groupItem['operator'] == SearchOperator.BETWEEN && <input placeholder={groupItem['addText']}
                                            onChange={(e) => selectValueDropdown(e.target.value, index, 'searchValueBetween', group.key)}
                                            onKeyDown={(e) => checkIfDecimals(e, index, group.key)}
                                            className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />}
                                    </div>
                                    {(groupItem['operator'] == SearchOperator.BEGINS_WITH || groupItem['operator'] == SearchOperator.ENDS_WITH || groupItem['operator'] == SearchOperator.CONTAINS || groupItem['operator'] == SearchOperator.IN_WC) && (saveAttributeType != DataTypeEnum.INTEGER && saveAttributeType != DataTypeEnum.FLOAT) &&
                                        <label htmlFor="caseSensitive" className="text-xs text-gray-500 cursor-pointer flex items-center pb-2"><input name="caseSensitive" className="mr-1 cursor-pointer"
                                            onChange={(e: any) => selectValueDropdown(e.target.checked, index, 'caseSensitive', group.key)} type="checkbox" />Case sensitive</label>}
                                </div>
                            </div>
                            <div className="w-full flex justify-center">
                                {index == fullSearch[group.key].groupElements.length - 1 &&
                                    <span onClick={() => addSearchGroupItem(groupItem, group.key)}
                                        className="bg-gray-100 text-gray-800 cursor-pointer p-1 rounded-md hover:bg-gray-300">
                                        <IconPlus className="cursor-pointer" />
                                    </span>}
                            </div>
                        </div>))}
                    </div>}
                    {fullSearch[group.key].value.group == SearchGroup.USER_FILTER && <div className="flex flex-row items-center mt-4">
                        <div className="flex flex-grow">
                            <div className="flex flex-col">
                                {fullSearch[group.key].groupElements['users'].map((groupItem, index) => (<div key={groupItem.id} className="my-1">
                                    <div className="form-control flex flex-row flex-nowrap items-center">
                                        <div onClick={() => setActiveNegateGroup(groupItem, index, group)} style={{ backgroundColor: groupItem.color, borderColor: groupItem.color }}
                                            className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                        </div>
                                        <span className="label-text truncate">{groupItem['displayName']}</span>
                                        {usersMap && usersMap[groupItem['id']] && <div><Tooltip content={groupItem['dataTip']} placement="left" color="invert">
                                            <IconInfoCircle className="ml-1 text-gray-700 h-5 w-5" onClick={() => dispatch(setModalStates(ModalEnum.USER_INFO, { open: true, userInfo: usersMap[groupItem['id']] }))} />
                                        </Tooltip></div>}
                                    </div>
                                </div>))}
                            </div>
                        </div>
                        <UserInfoModal />
                    </div>}
                    {fullSearch[group.key].value.group == SearchGroup.LABELING_TASKS && <div className="flex flex-row items-center mt-4">
                        <div className="flex-grow flex flex-col">

                            <div>Manually labeled</div>
                            {fullSearch[group.key].groupElements['manualLabels'].length == 0 ? (<ButtonLabelsDisabled />) : (
                                <Dropdown options={fullSearch[group.key].groupElements['manualLabels']} buttonName={manualLabels.length == 0 ? 'None selected' : manualLabels.join(',')} hasCheckboxes={true} keepDrownOpen={true}
                                    selectedOption={(option: any) => {
                                        const labels = [];
                                        option.forEach((a: any) => {
                                            if (a.checked) labels.push(a.name);
                                        });
                                        setManualLabels(labels);
                                        updateLabelsFullSearch(labels, group.key, 'manualLabels');
                                    }} />
                            )}

                            <div className="mt-2">Weakly supervised</div>
                            {fullSearch[group.key].groupElements['weakSupervisionLabels'].length == 0 ? (<ButtonLabelsDisabled />) : (
                                <Dropdown options={fullSearch[group.key].groupElements['weakSupervisionLabels']} buttonName={weakSupervisionLabels.length == 0 ? 'None selected' : weakSupervisionLabels.join(',')} hasCheckboxes={true}
                                    selectedOption={(option: any) => {
                                        const labels = [];
                                        option.forEach((a: any) => {
                                            if (a.checked) labels.push(a.name);
                                        });
                                        setWeakSupervisionLabels(labels);
                                        updateLabelsFullSearch(labels, group.key, 'weakSupervisionLabels');
                                    }} />
                            )}
                            <div className="flex-grow min-w-0 mt-1">
                                <div className="flex flex-row items-center">
                                    <span className="label-text mr-0.5 font-dmMono">CONFIDENCE BETWEEN</span>
                                    <input
                                        onChange={(e) => changeConfidence(e, 'lower', group.key, 'weakSupervisionConfidence')}
                                        value={fullSearch[group.key].groupElements['weakSupervisionConfidence']['lower']}
                                        className="h-8 w-11 border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                                    <span className="label-text mx-0.5 font-dmMono">% AND</span>
                                    <input
                                        onChange={(e) => changeConfidence(e, 'upper', group.key, 'weakSupervisionConfidence')}
                                        value={fullSearch[group.key].groupElements['weakSupervisionConfidence']['upper']}
                                        className="h-8 w-11 border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                                    {fullSearch[group.key].groupElements['weakSupervisionConfidence']['active'] && <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.CLEAR_WS_CONFIDENCE} color="invert">
                                        <IconFilterOff className="text-red-700 cursor-pointer" onClick={() => clearConfidence(fullSearch[group.key].groupElements['weakSupervisionConfidence'])} />
                                    </Tooltip>}
                                </div>
                            </div>

                            <div className="mt-2">Model callback</div>
                            {fullSearch[group.key].groupElements['modelCallbackLabels'].length == 0 ? (<ButtonLabelsDisabled />) : (
                                <Dropdown options={fullSearch[group.key].groupElements['modelCallbackLabels']} buttonName={modelCallBacksLabels.length == 0 ? 'None selected' : modelCallBacksLabels.join(',')} hasCheckboxes={true}
                                    selectedOption={(option: any) => {
                                        const labels = [];
                                        option.forEach((a: any) => {
                                            if (a.checked) labels.push(a.name);
                                        });
                                        setModelCallBacksLabels(labels);
                                        updateLabelsFullSearch(labels, group.key, 'modelCallbackLabels');
                                    }} />
                            )}
                            <div className="flex-grow min-w-0 mt-1">
                                <div className="flex flex-row items-center">
                                    <span className="label-text mr-0.5 font-dmMono">CONFIDENCE BETWEEN</span>
                                    <input
                                        onChange={(e) => changeConfidence(e, 'lower', group.key, 'modelCallbackConfidence')}
                                        value={fullSearch[group.key].groupElements['modelCallbackConfidence']['lower']}
                                        className="h-8 w-11 border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                                    <span className="label-text mx-0.5 font-dmMono">% AND</span>
                                    <input
                                        onChange={(e) => changeConfidence(e, 'upper', group.key, 'modelCallbackConfidence')}
                                        value={fullSearch[group.key].groupElements['modelCallbackConfidence']['upper']}
                                        className="h-8 w-11 border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                                    {fullSearch[group.key].groupElements['modelCallbackConfidence']['active'] && <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.CLEAR_MC_CONFIDENCE} color="invert">
                                        <IconFilterOff className="text-red-700 cursor-pointer" onClick={() => clearConfidence(fullSearch[group.key].groupElements['modelCallbackConfidence'])} />
                                    </Tooltip>}
                                </div>
                            </div>

                            <div className="mt-2 font-bold">Heuristics</div>
                            {fullSearch[group.key].groupElements['heuristics'].length == 0 ? (<div className="text-sm text-gray-400">No heuristics associated with this task</div>) : (<div className="flex flex-col">
                                <div className="flex items-center border-t border-t-gray-300 border-b border-b-gray-300">
                                    <div onClick={() => updateIsDifferent(group.key, fullSearch[group.key].groupElements['isWithDifferentResults'])} style={{ backgroundColor: fullSearch[group.key].groupElements['isWithDifferentResults'].color, borderColor: fullSearch[group.key].groupElements['isWithDifferentResults'].color }}
                                        className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                    </div>
                                    <span className="label-text truncate w-full pl-2">Only with different results</span>
                                </div>
                                {fullSearch[group.key].groupElements['heuristics'].map((groupItem, index) => (<div key={groupItem.id} className="my-1">
                                    <div className="flex flex-row items-center">
                                        <div onClick={() => setActiveNegateGroup(groupItem, index, group, true)} style={{ backgroundColor: groupItem.color, borderColor: groupItem.color }}
                                            className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                        </div>
                                        <span className="label-text truncate w-full pl-2">{groupItem['name']}</span>
                                    </div>
                                </div>))}
                            </div>)}
                        </div>
                    </div>}
                    {fullSearch[group.key].value.group == SearchGroup.ORDER_STATEMENTS && <div className="mt-4">
                        {fullSearch[group.key].groupElements['orderBy'].map((groupItem, index) => (<div key={groupItem.id}>
                            <div className="form-control class mb-2">
                                {groupItem['orderByKey'] != StaticOrderByKeys.RANDOM ? (<div className="mb-2 flex items-center">
                                    <div onClick={() => setSortFormControl(index, group)} className={`p-0 cursor-pointer ${groupItem['direction'] == 1 ? style.rotateTransform : null}`}>
                                        <div className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                            {groupItem['active'] != 0 && <IconArrowUp className="text-gray-500 h-3 w-3" />}
                                        </div>
                                    </div>
                                    <span className="ml-2 label-text truncate w-full">{groupItem['displayName']}</span>
                                </div>) : (<div className="flex flex-row items-center mr-2">
                                    <div onClick={() => setActiveNegateGroup(groupItem, index, group)} style={{ backgroundColor: groupItem.color, borderColor: groupItem.color }}
                                        className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                    </div>
                                    <span className="label-text truncate pl-2">{groupItem['displayName']}</span>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="ml-2 inline-flex items-center px-2.5 text-sm rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            Seed
                                            <div className="ml-2 cursor-pointer" onClick={() => setRandomSeedGroup()}>
                                                <IconArrowsRandom />
                                            </div>
                                        </span>
                                        <input placeholder={groupItem['seedString']}
                                            onChange={(e) => setRandomSeedGroup(e.target.value)}
                                            className="h-8 w-36 border-gray-300 rounded-r-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
                                    </div>
                                </div>)}
                            </div>
                        </div>))}
                    </div>}
                    {fullSearch[group.key].value.group == SearchGroup.COMMENTS && <div className="flex flex-row items-center mt-4">
                        <div className="flex-grow flex items-center">
                            <div className="flex flex-col">
                                <div className="my-1">
                                    {fullSearch[group.key].groupElements['hasComments'] && <div className="form-control flex flex-row flex-nowrap">
                                        <div onClick={() => setActiveNegateGroup(fullSearch[group.key].groupElements['hasComments'], null, group)} style={{ backgroundColor: fullSearch[group.key].groupElements['hasComments'].color, borderColor: fullSearch[group.key].groupElements['hasComments'].color }}
                                            className="ml-2 mr-2 h-4 w-4 border-gray-300 border rounded cursor-pointer hover:bg-gray-200">
                                        </div>
                                        <span className="ml-2 label-text truncate">Record with comments</span>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>}

                    {(fullSearch[group.key].value.group != SearchGroup.ATTRIBUTES && fullSearch[group.key].value.group != SearchGroup.USER_FILTER && fullSearch[group.key].value.group != SearchGroup.LABELING_TASKS && fullSearch[group.key].value.group != SearchGroup.ORDER_STATEMENTS && fullSearch[group.key].value.group != SearchGroup.COMMENTS) && <p>{'Default :('}</p>}
                </form>
            </div>
        </div >))
        }
        <div className="mt-4 grid items-center" style={{ gridTemplateColumns: 'max-content max-content max-content max-content max-content' }}>
            {fullSearch[SearchGroup.DRILL_DOWN] && <div className="flex flex-row items-center">
                <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.CONNECT} color="invert" placement="right">
                    <div className="cursor-help mr-2 underline filtersUnderline">
                        Connect by
                    </div>
                </Tooltip>
                <div className="flex items-center">
                    <input type="radio" name="drillDown" id="radio-drill-down-inactive"
                        onChange={() => handleDrillDown(false)} checked={!fullSearch[SearchGroup.DRILL_DOWN].value}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-200" />
                    <label htmlFor="radio-drill-down-inactive" className="cursor-pointer label p-1 label-text pr-2 font-dmMono">
                        OR
                    </label>
                </div>
                <div className="flex items-center mr-3">
                    <input id="radio-drill-down-active" type="radio"
                        onChange={() => handleDrillDown(true)} checked={fullSearch[SearchGroup.DRILL_DOWN].value}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-200" />
                    <label htmlFor="radio-drill-down-active" className="cursor-pointer label p-1 label-text pr-2 font-dmMono">
                        AND
                    </label>
                </div>
            </div>}
        </div >
        <DataSliceOperations fullSearch={fullSearch} />
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