import { SearchGroupElement } from "@/src/types/components/projects/projectId/data-browser/data-browser";
import { SearchGroupItem, SearchItemType } from "@/src/types/components/projects/projectId/data-browser/search-groups";
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { nameForGroupKeyToString } from "@/submodules/javascript-functions/enums/enum-functions";
import { SearchGroup } from "@/submodules/javascript-functions/enums/enums";

export function getBasicSearchGroup(
    group: SearchGroup,
    sortOrder: number,
    nameAdd: string = '',
    keyAdd: string = null,
): SearchGroupElement {
    return {
        group: group,
        key: group + (keyAdd ? '_' + keyAdd : ''),
        sortOrder: sortOrder,
        isOpen: false,
        inOpenTransition: false,
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
        searchValue: 'x',
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

export function buildUserArray(users) {
    let array = [];
    for (const u of users) {
        if (u.countSum == 0) continue;
        const user = u.user ? u.user : u;
        let name = "Unknown";
        let shortName = "Unknown";
        if (user.firstName) {
            name = user.firstName + ' ' + user.lastName;
            shortName = user.firstName[0] + '. ' + user.lastName;
        }

        array.push({
            id: user.id,
            active: false,
            negate: false,
            displayName: name,
            name: shortName,
            dataTip: user.mail ? user.mail : "Unknown user ID"
        });
    }
    return array;
}