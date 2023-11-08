import { selectAttributes, selectLabelingTasksAll } from "@/src/reduxStore/states/pages/settings";
import { selectProject } from "@/src/reduxStore/states/project";
import { SearchGroupElement } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { getBasicGroupItems, getBasicSearchGroup, getBasicSearchItem } from "@/src/util/components/projects/projectId/data-browser/search-groups-helper";
import { SearchGroup } from "@/submodules/javascript-functions/enums/enums";
import { IconArrowBadgeDown, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import style from '@/src/styles/components/projects/projectId/data-browser.module.css';
import { timer } from "rxjs";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { checkDecimalPatterns, getAttributeType, getSearchOperatorTooltip } from "@/src/util/components/projects/projectId/data-browser/search-operators-helper";
import { DataTypeEnum } from "@/src/types/shared/general";

const GROUP_SORT_ORDER = 0;
let GLOBAL_SEARCH_GROUP_COUNT = 0;

export default function SearchGroups() {
    const project = useSelector(selectProject);
    const attributes = useSelector(selectAttributes);
    const labelingTasks = useSelector(selectLabelingTasksAll);

    const [fullSearch, setFullSearch] = useState<any>({});
    const [searchGroups, setSearchGroups] = useState<{ [key: string]: SearchGroupElement }>({});
    const [searchGroupsOrder, setSearchGroupsOrder] = useState<{ order: number; key: string }[]>([]);
    const [attributesSortOrder, setAttributeSortOrder] = useState([]);
    const [operatorsDropdown, setOperatorsDropdown] = useState([]);
    const [tooltipsArray, setTooltipArray] = useState([]);
    const [saveDropdownAttribute, setSaveDropdownAttribute] = useState(null);
    const [saveAttributeType, setSaveAttributeType] = useState(null);

    useEffect(() => {
        if (!project) return;
        prepareSearchGroups();
    }, [project]);

    useEffect(() => {
        if (!attributes) return;
        const attributesSort = [];
        attributesSort.push({
            name: 'Any Attribute',
            key: null,
            order: 0,
            type: 'TEXT'
        });
        attributes.forEach((att) => {
            attributesSort.push({
                name: att.name,
                key: att.id,
                order: att.relativePosition,
                type: att.dataType,
            });
        });
        setAttributeSortOrder(attributesSort);
    }, [attributes]);

    useEffect(() => {
        if (!attributesSortOrder) return;
        if (!fullSearch || !fullSearch[SearchGroup.ATTRIBUTES]) return;
        getOperatorDropdownValues();
    }, [searchGroups, attributesSortOrder]);

    useEffect(() => {
        console.log("full search", fullSearch);
    }, [fullSearch]);

    function prepareSearchGroups() {
        if (!attributes || !labelingTasks) {
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
        fullSearch["DRILL_DOWN"] = { value: false, groupElements: [] };

        // Attributes
        const searchGroupContainer = getBasicSearchGroup(SearchGroup.ATTRIBUTES, GROUP_SORT_ORDER + 100);
        fullSearchCopy[SearchGroup.ATTRIBUTES] = { value: searchGroupContainer, groupElements: [] };
        searchGroupsCopy[SearchGroup.ATTRIBUTES] = searchGroupContainer;
        for (let baseItem of getBasicGroupItems(
            searchGroupContainer.group,
            searchGroupContainer.key
        )) {
            fullSearchCopy[SearchGroup.ATTRIBUTES].groupElements.push(attributeCreateSearchGroup(baseItem));
        }
        for (let [key, value] of Object.entries(searchGroupsCopy)) {
            const findEl = searchGroupsOrderCopy.find(el => el.key == key);
            if (findEl == undefined) {
                searchGroupsOrderCopy.push({ order: value.sortOrder, key: key });
            }
        }
        setSearchGroups(searchGroupsCopy);
        setFullSearch(fullSearchCopy);

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

    function attributeCreateSearchGroup(item) {
        return {
            id: ++GLOBAL_SEARCH_GROUP_COUNT,
            group: item.group,
            groupKey: item.groupKey,
            type: item.type,
            name: item.defaultValue,
            active: false,
            negate: false,
            addText: item.addText,
            operator: item.operator,
            searchValue: 'x',
            searchValueBetween: '',
            caseSensitive: false
        }
    }

    function setActiveNegateGroup(groupItem, index, group) {
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
        const fullSearchCopy = { ...fullSearch };
        fullSearchCopy[group.key].groupElements[index] = groupItemCopy;
        setFullSearch(fullSearchCopy);
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
        fullSearchCopy[groupKey].groupElements.push(attributeCreateSearchGroup(item));
        setFullSearch(fullSearchCopy);
    }

    function selectValueDropdown(value: string, i: number, field: string, key: any) {
        const fullSearchCopy = { ...fullSearch };
        const formControlsIdx = fullSearchCopy[key].groupElements[i];
        formControlsIdx[field] = value;
        if (field == 'name') {
            const attributeType = getAttributeType(attributesSortOrder, value);
            //   this.saveDropdownAttribute = value;
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
    }

    function checkIfDecimals(event: any, i: number, key: string) {
        const formControlsIdx = fullSearch[key].groupElements[i];
        const attributeType = getAttributeType(attributesSortOrder, formControlsIdx['name']);
        checkDecimalPatterns(attributeType, event, formControlsIdx['operator'], '-');
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
            <div className={`${style.transitionAll} ml-4`} style={{ maxHeight: searchGroups[group.key].isOpen ? '300px' : '0px', display: searchGroups[group.key].isOpen ? 'block' : 'none' }}>
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
                                            <Dropdown options={attributesSortOrder} buttonName={groupItem.name}
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
                    {fullSearch[group.key].value.group != SearchGroup.ATTRIBUTES && <p>{'Default :('}</p>}
                </form>
            </div>
        </div >))
        }
    </>)
}