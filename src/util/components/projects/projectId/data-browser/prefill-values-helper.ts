// TODO: The current implementation on the data browser is different from the Angular version of the data browser.
// This is because every part of the dynamic forms in Angular was a form array and there is no need to do that.
// This helper is used to prefill the values of the form in the data browser (update old values to current version).

import { SearchGroup } from "@/submodules/javascript-functions/enums/enums";
import { getActiveNegateGroupColor } from "./data-browser-helper";


export function addGroupToSearchElement(searchElement, labelingTasks) {
    if (searchElement.groupElements[0].hasOwnProperty('operator')) {
        searchElement.groupElements.forEach(element => {
            element.group = SearchGroup.ATTRIBUTES;
        });
    } else if (searchElement.groupElements[0].hasOwnProperty('manualLabels')) {
        const saveEl = searchElement.groupElements[0];
        const newElement = {
            id: saveEl.id,
            group: SearchGroup.LABELING_TASKS,
            groupKey: SearchGroup.LABELING_TASKS + '_' + saveEl.taskId,
            type: saveEl.type,
            taskTarget: saveEl.taskTarget,
            taskId: saveEl.taskId,
            active: saveEl.active,
            manualLabels: saveEl.manualLabels,
            weakSupervisionLabels: saveEl.weakSupervisionLabels,
            sortByWeakSupervisionConfidence: saveEl.sortByWeakSupervisionConfidence,
            weakSupervisionConfidence: saveEl.weakSupervisionConfidence,
            heuristics: saveEl.informationSources,
            isWithDifferentResults: saveEl.isWithDifferentResults,
        }
        searchElement.groupElements = newElement;
        searchElement.nameAdd = labelingTasks.find((item: any) => item.id == saveEl.taskId)?.name;
    } else if (searchElement.groupElements[0].hasOwnProperty('orderBy')) {
        const saveEl = searchElement.groupElements[0];
        const newElement = {
            id: saveEl.id,
            group: SearchGroup.ORDER_STATEMENTS,
            orderBy: saveEl.orderBy,
        }
        searchElement.groupElements = newElement;
    } else if (searchElement.groupElements[0].hasOwnProperty('hasComments')) {
        const saveEl = searchElement.groupElements[0];
        const newElement = {
            id: saveEl.id,
            group: SearchGroup.COMMENTS,
            hasComments: saveEl.hasComments[0],
        }
        searchElement.groupElements = newElement;
    }
    return searchElement;
}

export function prefillActiveValues(parse: any, fullSearchStoreCopy: any) {
    Object.values(parse).forEach((el: any) => {
        if (el[SearchGroup.DRILL_DOWN]) {
            fullSearchStoreCopy[SearchGroup.DRILL_DOWN] = el[SearchGroup.DRILL_DOWN];
        } else {
            if (!el.hasOwnProperty('groupElements')) return;
            el.groupElements.forEach((groupItem: any, index: number) => {
                if (groupItem.hasOwnProperty('operator')) {
                    if (groupItem.active) {
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].active = true;
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].operator = groupItem.operator;
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].searchValue = groupItem.searchValue;
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].searchValueBetween = groupItem.searchValueBetween;
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].negate = groupItem.negate;
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].caseSensitive = groupItem.caseSensitive;
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].name = groupItem.name;
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].id = groupItem.id;
                        fullSearchStoreCopy[SearchGroup.ATTRIBUTES].groupElements[index].color = getActiveNegateGroupColor(groupItem);
                    }
                } else if (groupItem.hasOwnProperty('orderBy')) {
                    groupItem.orderBy.forEach((orderByItem: any) => {
                        if (orderByItem.active) {
                            const findIdx = fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy.findIndex((item: any) => item.id == orderByItem.id);
                            if (findIdx == -1) return;
                            fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy[findIdx].active = true;
                            fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy[findIdx].direction = orderByItem.direction;
                            fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy[findIdx].orderByKey = orderByItem.orderByKey;
                            fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy[findIdx].displayName = orderByItem.displayName;
                            fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy[findIdx].id = orderByItem.id;
                            fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy[findIdx].seedString = orderByItem.seedString;
                            fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy[findIdx].isAttribute = orderByItem.isAttribute;
                            fullSearchStoreCopy[SearchGroup.ORDER_STATEMENTS].groupElements.orderBy[findIdx].color = getActiveNegateGroupColor(orderByItem);
                        }
                    });
                } else if (groupItem.hasOwnProperty('hasComments')) {
                    if (groupItem.hasComments[0].active) {
                        fullSearchStoreCopy[SearchGroup.COMMENTS].groupElements.hasComments.active = true;
                        fullSearchStoreCopy[SearchGroup.COMMENTS].groupElements.hasComments.negate = groupItem.hasComments[0].negate;
                        fullSearchStoreCopy[SearchGroup.COMMENTS].groupElements.hasComments.color = getActiveNegateGroupColor(groupItem.hasComments[0]);
                    }
                } else if (groupItem.hasOwnProperty('manualLabels')) {
                    const manualLabels = groupItem.manualLabels;
                    manualLabels.forEach((manualLabel: any, index: number) => {
                        if (manualLabel.active) {
                            const key = SearchGroup.LABELING_TASKS + '_' + groupItem.taskId;
                            fullSearchStoreCopy[key].groupElements.manualLabels[index].active = true;
                            fullSearchStoreCopy[key].groupElements.manualLabels[index].negate = manualLabel.negate;
                            fullSearchStoreCopy[key].groupElements.manualLabels[index].name = manualLabel.name;
                            fullSearchStoreCopy[key].groupElements.manualLabels[index].id = manualLabel.id;
                        }
                    });

                } else if (groupItem.hasOwnProperty('weakSupervisionLabels')) {
                    const weakSupervisionLabels = groupItem.weakSupervisionLabels;
                    weakSupervisionLabels.forEach((weakSupervisionLabel: any, index: number) => {
                        if (weakSupervisionLabel.active) {
                            const key = SearchGroup.LABELING_TASKS + '_' + groupItem.taskId;
                            fullSearchStoreCopy[key].groupElements.weakSupervisionLabels[index].active = true;
                            fullSearchStoreCopy[key].groupElements.weakSupervisionLabels[index].negate = weakSupervisionLabel.negate;
                            fullSearchStoreCopy[key].groupElements.weakSupervisionLabels[index].name = weakSupervisionLabel.name;
                            fullSearchStoreCopy[key].groupElements.weakSupervisionLabels[index].id = weakSupervisionLabel.id;
                        }
                    });
                } else if (groupItem.hasOwnProperty('informationSources') || groupItem.hasOwnProperty('heuristics')) {
                    const heuristics = groupItem.informationSources;
                    heuristics.forEach((heuristic: any, index: number) => {
                        if (heuristic.active) {
                            const key = SearchGroup.LABELING_TASKS + '_' + groupItem.taskId;
                            fullSearchStoreCopy[key].groupElements.heuristics[index].active = true;
                            fullSearchStoreCopy[key].groupElements.heuristics[index].negate = heuristic.negate;
                            fullSearchStoreCopy[key].groupElements.heuristics[index].name = heuristic.name;
                            fullSearchStoreCopy[key].groupElements.heuristics[index].id = heuristic.id;
                        }
                    });
                } else if (groupItem.hasOwnProperty('isWithDifferentResults')) {
                    const key = SearchGroup.LABELING_TASKS + '_' + groupItem.taskId;
                    fullSearchStoreCopy[key].groupElements.isWithDifferentResults.active = groupItem.isWithDifferentResults.active;
                    fullSearchStoreCopy[key].groupElements.isWithDifferentResults.taskId = groupItem.isWithDifferentResults.taskId;
                    fullSearchStoreCopy[key].groupElements.isWithDifferentResults.taskType = groupItem.isWithDifferentResults.taskType;
                } else if (groupItem.hasOwnProperty('confidence')) {
                    const key = SearchGroup.LABELING_TASKS + '_' + groupItem.taskId;
                    fullSearchStoreCopy[key].groupElements.weakSupervisionConfidence.active = groupItem.confidence.active;
                    fullSearchStoreCopy[key].groupElements.weakSupervisionConfidence.upper = groupItem.confidence.upper;
                    fullSearchStoreCopy[key].groupElements.weakSupervisionConfidence.lower = groupItem.confidence.lower;
                    fullSearchStoreCopy[key].groupElements.weakSupervisionConfidence.negate = groupItem.confidence.negate;
                }
            });
        }
    });
    return fullSearchStoreCopy;
}

export function checkActiveGroups(group: any, searchGroup: any) {
    for (let [key, value] of Object.entries(group)) {
        const val2 = value as any;
        if (!value.hasOwnProperty('groupElements')) continue;
        if (Array.isArray(val2.groupElements)) {
            const findActive = val2.groupElements.filter((item: any) => item.active);
            if (findActive.length > 0) searchGroup[key].isOpen = true;
        } else if (val2.groupElements.hasOwnProperty('orderBy')) {
            const findActive = val2.groupElements.orderBy.filter((item: any) => item.active);
            if (findActive.length > 0) searchGroup[key].isOpen = true;
        } else if (val2.groupElements.hasOwnProperty('hasComments')) {
            if (val2.groupElements.hasComments.active) searchGroup[key].isOpen = true;
        } else if (val2.groupElements.hasOwnProperty('manualLabels')) {
            const findActive = val2.groupElements.manualLabels.filter((item: any) => item.active);
            if (findActive.length > 0) searchGroup[key].isOpen = true;
        } else if (val2.groupElements.hasOwnProperty('weakSupervisionLabels')) {
            const findActive = val2.groupElements.weakSupervisionLabels.filter((item: any) => item.active);
            if (findActive.length > 0) searchGroup[key].isOpen = true;
        } else if (val2.groupElements.hasOwnProperty('heuristics')) {
            const findActive = val2.groupElements.heuristics.filter((item: any) => item.active);
            if (findActive.length > 0) searchGroup[key].isOpen = true;
        } else if ((val2.groupElements.weakSupervisionConfidence && val2.groupElements.weakSupervisionConfidence.active) ||
            (val2.groupElements.isWithDifferentResults && val2.groupElements.isWithDifferentResults.active)) {
            searchGroup[key].isOpen = true;
        }
    }
    return searchGroup;
}