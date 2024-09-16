import { SearchGroupElement } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { SearchGroupItem, SearchItemType } from "@/src/types/components/projects/projectId/data-browser/search-groups";
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { LabelingTask, LabelingTaskTarget } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { getOrderByDisplayName, nameForGroupKeyToString } from "@/submodules/javascript-functions/enums/enum-functions";
import { InformationSourceType, SearchGroup, StaticOrderByKeys } from "@/submodules/javascript-functions/enums/enums";

export const SEED_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function getBasicSearchGroup(
    group: SearchGroup,
    sortOrder: number,
    nameAdd: string = '',
    keyAdd: string = null
): SearchGroupElement {
    return {
        group: group,
        key: group + (keyAdd ? '_' + keyAdd : ''),
        sortOrder: sortOrder,
        isOpen: false,
        name: nameForGroupKeyToString(group),
        nameAdd: nameAdd,
        subText: getSubTextForGroupKey(group),
    };
}

function getSubTextForGroupKey(group: SearchGroup): string {
    switch (group) {
        case SearchGroup.ATTRIBUTES:
            return 'Filter on attributes of your records';
        case SearchGroup.USER_FILTER:
            return 'Filter manual labels by creation user';
        case SearchGroup.LABELING_TASKS:
            return 'Choose from anything related to';
        case SearchGroup.ORDER_STATEMENTS:
            return 'Order your results';
        case SearchGroup.COMMENTS:
            return 'Filter on comments';
    }
    return '';
}

export function getBasicGroupItems(
    group: SearchGroup,
    groupKey: string
): SearchGroupItem[] {
    switch (group) {
        case SearchGroup.ATTRIBUTES:
            return [getBasicSearchItem(SearchItemType.ATTRIBUTE, groupKey)];
        case SearchGroup.USER_FILTER:
            return [getBasicSearchItem(SearchItemType.USER, groupKey)];
        case SearchGroup.LABELING_TASKS:
            return [getBasicSearchItem(SearchItemType.LABELING_TASK, groupKey)];
        case SearchGroup.ORDER_STATEMENTS:
            return [getBasicSearchItem(SearchItemType.ORDER_BY, groupKey)];
        case SearchGroup.COMMENTS:
            return [getBasicSearchItem(SearchItemType.COMMENTS, groupKey)];
    }
}

export function getBasicSearchItem(
    item: SearchItemType,
    groupKey: string
): SearchGroupItem {
    switch (item) {
        case SearchItemType.ATTRIBUTE:
            return {
                type: SearchItemType.ATTRIBUTE,
                group: SearchGroup.ATTRIBUTES,
                groupKey: groupKey,
                addText: 'Enter any string',
                defaultValue: 'Any Attribute',
                operator: SearchOperator.CONTAINS,
            };
        case SearchItemType.USER:
            return {
                type: SearchItemType.USER,
                group: SearchGroup.USER_FILTER,
                groupKey: groupKey,
                addText: 'much question, so wow',
            };
        case SearchItemType.LABELING_TASK:
            return {
                type: SearchItemType.LABELING_TASK,
                group: SearchGroup.LABELING_TASKS,
                groupKey: groupKey,
                addText: 'much question, so wow',
            };
        case SearchItemType.ORDER_BY:
            return {
                type: SearchItemType.ORDER_BY,
                group: SearchGroup.ORDER_STATEMENTS,
                groupKey: groupKey,
                addText: 'Random sampling',
            };
        case SearchItemType.COMMENTS:
            return {
                type: SearchItemType.COMMENTS,
                group: SearchGroup.COMMENTS,
                groupKey: groupKey,
                addText: 'much question, so wow',
            };
    }
}

export function attributeCreateSearchGroup(item, globalSearchGroupCount) {
    return {
        id: globalSearchGroupCount,
        group: item.group,
        groupKey: item.groupKey,
        type: item.type,
        name: item.defaultValue,
        active: false,
        negate: false,
        addText: item.addText,
        operator: item.operator,
        searchValue: '',
        searchValueBetween: '',
        caseSensitive: false
    }
}

export function userCreateSearchGroup(item, globalSearchGroupCount, users) {
    return {
        id: globalSearchGroupCount,
        group: item.group,
        groupKey: item.groupKey,
        active: false,
        negate: false,
        type: item.type,
        name: item.defaultValue,
        addText: item.addText,
        users: buildUserArray(users),
        updateDummy: true
    }
}

function buildUserArray(users) {
    let array = [];
    for (const [key, value] of Object.entries(users)) {
        const value2 = value as any;
        let name = "Unknown";
        let shortName = "Unknown";
        if (value2.firstName) {
            name = value2.firstName + ' ' + value2.lastName;
            shortName = value2.firstName[0] + '. ' + value2.lastName;
        }
        array.push({
            id: value2.id,
            active: false,
            negate: false,
            displayName: name,
            name: shortName,
            dataTip: value2.mail ? value2.mail : "Unknown user ID"
        });
    }
    return array;
}

export function labelingTasksCreateSearchGroup(item, task: LabelingTask, globalSearchGroupCount: number) {
    return {
        id: globalSearchGroupCount,
        group: item.group,
        groupKey: item.groupKey,
        type: item.type,
        taskTarget: task.taskTarget == LabelingTaskTarget.ON_ATTRIBUTE ? task.attribute.name : 'Full Record',
        taskId: task.id,
        active: false,
        manualLabels: labelingTaskLabelArray(task),
        weakSupervisionLabels: labelingTaskLabelArray(task),
        modelCallbackLabels: labelingTaskLabelArray(task),
        sortByWeakSupervisionConfidence: getOrderByGroup(StaticOrderByKeys.WEAK_SUPERVISION_CONFIDENCE, false, -1),
        sortByModelCallbackConfidence: getOrderByGroup(StaticOrderByKeys.MODEL_CALLBACK_CONFIDENCE, false, -1),
        weakSupervisionConfidence: getConfidenceFilter(),
        modelCallbackConfidence: getConfidenceFilter(),
        heuristics: labelingTaskHeuristicArray(task),
        isWithDifferentResults: isWithDifferentResults(task),
    }
}

function labelingTaskLabelArray(task: LabelingTask) {
    let array = [];
    let noLabelItemExists = false;
    for (let l of task.labels) {
        noLabelItemExists = (noLabelItemExists || l.id === 'NO_LABEL') ? true : false,
            array.push({
                id: l.id,
                name: l.name,
                active: l.active === undefined ? false : l.active,
                negate: l.negate === undefined ? false : l.negate,
            });
    }
    if (task.labels.length > 0 && !noLabelItemExists) {
        array.push({
            id: 'NO_LABEL',
            name: 'Has no label', //filter not in labelid to ensure only the ones from task are used -- join part
            active: false,
        });
    }
    return array;
}

function getConfidenceFilter() {
    return {
        active: false,
        negate: false,
        lower: 0,
        upper: 100
    }
}

function labelingTaskHeuristicArray(task: LabelingTask) {
    let array = []
    for (let l of task.informationSources) {
        if (l.type == InformationSourceType.LABELING_FUNCTION || l.type == InformationSourceType.ACTIVE_LEARNING || l.type === undefined) {
            array.push({
                id: l.id,
                name: l.name,
                active: false,
                negate: false,
            });
        }
    }
    return array;
}

function isWithDifferentResults(task: LabelingTask) {
    return {
        active: false,
        taskId: task.id,
        taskType: task.taskType
    }
}

export function orderByCreateSearchGroup(item, globalSearchGroupCount, attributesSortOrder, attributesDict) {
    return {
        id: globalSearchGroupCount,
        group: item.group,
        groupKey: item.groupKey,
        type: item.type,
        name: item.defaultValue,
        addText: item.addText,
        orderBy: orderByArray(attributesSortOrder, attributesDict),
        updateDummy: true
    }
}

function orderByArray(attributesSortOrder: any[] = [], attributesDict: any) {
    let array = [];
    for (let i = 1; i < attributesSortOrder.length; i++) {
        array.push(getOrderByGroup(attributesDict[attributesSortOrder[i].key].name, true, -1)) //1, //-1 desc, 1 asc     
    }
    array.push(getOrderByGroup(StaticOrderByKeys.WEAK_SUPERVISION_CONFIDENCE, false, -1));
    array.push(getOrderByGroup(StaticOrderByKeys.MODEL_CALLBACK_CONFIDENCE, false, -1));
    array.push(getOrderByGroup(StaticOrderByKeys.RANDOM, false, -1));

    return array;
}

function getOrderByGroup(orderByKey: string, isAttribute: boolean, direction) {
    let group;
    if (orderByKey == StaticOrderByKeys.RANDOM) {
        group = {
            id: orderByKey,
            orderByKey: orderByKey,
            active: false,
            seedString: generateRandomSeed(),
            displayName: getOrderByDisplayName(orderByKey),
            isAttribute: isAttribute,
        }
    } else {
        group = {
            id: orderByKey,
            orderByKey: orderByKey,
            active: false,
            direction: direction,
            displayName: getOrderByDisplayName(orderByKey),
            isAttribute: isAttribute,
        }
    }
    return group;
}

export function generateRandomSeed() {
    const length = 7;
    let seed = '';
    const charactersLength = SEED_CHARACTERS.length;
    for (var i = 0; i < length; i++) {
        seed += SEED_CHARACTERS.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return seed;
}

export function commentsCreateSearchGroup(item, globalSearchGroupCount) {
    return {
        id: globalSearchGroupCount,
        group: item.group,
        groupKey: item.groupKey,
        active: false,
        negate: false,
        type: item.type,
        name: item.defaultValue,
        hasComments: {
            active: false,
            negate: false
        },
        updateDummy: true
    }
}