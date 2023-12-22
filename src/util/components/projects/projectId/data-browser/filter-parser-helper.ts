import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { DataTypeEnum, User } from "@/src/types/shared/general";
import { LabelSource, SearchGroup, StaticOrderByKeys } from "@/submodules/javascript-functions/enums/enums";
import { getAttributeType, parseFilterElements, prepareFilterElements, prepareOperator } from "./search-operators-helper";
import { LabelingTask } from "@/src/types/components/projects/projectId/settings/labeling-tasks";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";

export function parseFilterToExtended(activeSearchParams, attributes: Attribute[], configuration: any, labelingTasks: LabelingTask[], user: User, drillDownVal: boolean): string[] {
    let toReturn = [];
    toReturn.push(JSON.stringify(buildFilterRecordCategory(true)));
    let first = false;
    let attributeFilter;
    let orderBy = { ORDER_BY: [], ORDER_DIRECTION: [] };
    for (let searchElement of activeSearchParams) {
        if (searchElement.values.group == SearchGroup.ATTRIBUTES) {
            attributeFilter = buildFilterElementAttribute(first, searchElement, attributes, configuration);
            if (attributeFilter) toReturn.push(JSON.stringify(attributeFilter));
        } else if (searchElement.values.group == SearchGroup.LABELING_TASKS) {
            appendBlackAndWhiteListLabelingTask(toReturn, searchElement.values, labelingTasks, drillDownVal);
            toReturn = toReturn.filter((el) => el != null);
        } else if (searchElement.values.group == SearchGroup.USER_FILTER) {
            toReturn.push(appendBlackAndWhiteListUser(toReturn, searchElement, drillDownVal));
            toReturn = toReturn.filter((el) => el != null);
        } else if (searchElement.values.group == SearchGroup.ORDER_STATEMENTS) {
            orderBy.ORDER_BY = appendActiveOrderBy(searchElement.values.orderBy, orderBy);
            if (orderBy.ORDER_BY.length > 0) {
                toReturn.push(JSON.stringify(orderBy));
            }
        } else if (searchElement.values.group == SearchGroup.COMMENTS) {
            toReturn.push(appendBlackAndWhiteListComments(toReturn, searchElement, user));
        }
    }
    if (!toReturn[1]) toReturn.splice(1, 1);
    return toReturn;
}

export function getRawFilterForSave(fullSearch): string {
    return JSON.stringify(fullSearch);
}

function buildFilterElementAttribute(first: boolean, searchElement: any, attributes: Attribute[], configuration) {
    let filterElement;
    if (searchElement.values.name == 'Any Attribute') {
        filterElement = {
            RELATION: first ? 'NONE' : 'AND',
            NEGATION: searchElement.values.negate,
            FILTER: [],
        };
        let added = false;
        for (let i = 1; i < attributes.length; i++) {
            const searchEl = jsonCopy(searchElement);
            searchEl.values.operator = searchEl.values.operator.split(" ").join("_");
            if (attributes[i].dataType != DataTypeEnum.BOOLEAN) {
                const filterValues = prepareFilterElements(searchEl, attributes[i].name, configuration.separator, attributes[i].dataType);
                if (!filterValues) continue;
                filterElement.FILTER.push({
                    RELATION: !added ? 'NONE' : 'OR',
                    NEGATION: false,
                    TARGET_TABLE: 'RECORD',
                    TARGET_COLUMN: 'DATA',
                    OPERATOR: prepareOperator(searchEl, attributes[i].dataType),
                    VALUES: filterValues,
                });
                added = true;
            }
        }
        let parseArray = [];
        if (isNaN(parseInt(searchElement.values.searchValue)) || isNaN(parseFloat(searchElement.values.searchValue))) {
            filterElement.FILTER.forEach((el) => {
                const type = getAttributeType(attributes, el.VALUES[0]);
                const parseValues = parseFilterElements(searchElement, el.VALUES, type);
                if (typeof parseValues[1] === 'string') {
                    if (parseArray.length === 0) {
                        el.RELATION = "NONE";
                    }
                    parseArray.push(el);
                }
            });
            filterElement.FILTER = parseArray;
        }
        if (filterElement.FILTER.length == 0) return null;
        else return filterElement;
    } else {
        const attributeType = attributes.find(a => a.name == searchElement.values.name).dataType;
        const searchEl = jsonCopy(searchElement);
        searchEl.values.operator = searchEl.values.operator.split(" ").join("_");
        filterElement = {
            RELATION: first ? 'NONE' : 'AND',
            NEGATION: searchEl.values.negate,
            TARGET_TABLE: 'RECORD',
            TARGET_COLUMN: 'DATA',
            OPERATOR: prepareOperator(searchEl, attributeType),
            VALUES: prepareFilterElements(searchEl, searchEl.values.name, configuration.separator, attributeType),
        };
    }
    if (filterElement.VALUES) return filterElement
    else return null;
}

function appendBlackAndWhiteListLabelingTask(appendTo, searchElement, labelingTasks: LabelingTask[], drillDownVal: boolean) {
    const drillDown: boolean = drillDownVal;
    const labelingTask = labelingTasks.find(l => l.id == searchElement.values.taskId);
    appendTo.push(appendBlackAndWhiteListLabelingTaskForArray(appendTo, searchElement.values.manualLabels, LabelSource.MANUAL, drillDown));
    appendBlackAndWhiteListLabelingTaskForArray(appendTo, searchElement.values.weakSupervisionLabels, LabelSource.WEAK_SUPERVISION, drillDown);
    appendBlackAndWhiteListLabelingTaskForArray(appendTo, searchElement.values.modelCallbackLabels, LabelSource.MODEL_CALLBACK, drillDown);
    appendBlackAndWhiteListLabelingTaskForArray(appendTo, searchElement.values.heuristics, LabelSource.INFORMATION_SOURCE, drillDown);
    appendBlackAndWhiteListLabelingTaskForConfidence(appendTo, searchElement.values.weakSupervisionConfidence, labelingTask.labels.map(l => l.id), true);
    appendBlackAndWhiteListLabelingTaskForConfidence(appendTo, searchElement.values.modelCallbackConfidence, labelingTask.labels.map(l => l.id), false);
    if (!appendTo) return;

    const isMixed = searchElement.values.isWithDifferentResults
    if (isMixed.active) {
        let whitelist = {
            SUBQUERY_TYPE: 'WHITELIST',
            SUBQUERIES: [{
                QUERY_TEMPLATE: isMixed.taskType == 'MULTICLASS_CLASSIFICATION' ? 'SUBQUERY_RLA_DIFFERENT_IS_CLASSIFICATION' : 'SUBQUERY_RLA_DIFFERENT_IS_EXTRACTION',
                VALUES: [isMixed.taskId],
            }],
        };
        return appendTo.push(JSON.stringify(whitelist));
    }
    return appendTo;
}

function appendBlackAndWhiteListLabelingTaskForArray(
    appendTo: string[],
    array: any[],
    labelSource: LabelSource,
    drillDown: boolean = false,
    onlyNoLabel: boolean = false //for recursion of NO_LABEL only
): any {
    if (drillDown) {
        for (const l of array) {
            if (l.id == 'NO_LABEL') {
                appendTo.push(appendBlackAndWhiteListLabelingTaskForArray(appendTo, array, labelSource, false, true));
            } else {
                appendTo.push(appendBlackAndWhiteListLabelingTaskForArray(appendTo, [l], labelSource, false));
            }
        }
        return;
    }

    const forLabel = labelSource != LabelSource.INFORMATION_SOURCE;
    let whitelist = {
        SUBQUERY_TYPE: 'WHITELIST',
        SUBQUERIES: [],
    };
    let blacklist = {
        SUBQUERY_TYPE: 'BLACKLIST',
        SUBQUERIES: [],
    };
    let addNoLabel = false;
    let inValues = [],
        notInValues = [];
    for (let c of array) {
        if (c.active) {
            if (c.id == 'NO_LABEL') addNoLabel = true;
            else if (!onlyNoLabel) {
                if (c.negate) notInValues.push(c.id);
                else inValues.push(c.id);
            }
        }
    }
    if (inValues.length != 0) {
        whitelist.SUBQUERIES.push({
            QUERY_TEMPLATE: forLabel
                ? 'SUBQUERY_RLA_LABEL'
                : 'SUBQUERY_RLA_INFORMATION_SOURCE',
            VALUES: [labelSource, ...inValues],
        });
    }
    if (notInValues.length != 0) {
        blacklist.SUBQUERIES.push({
            QUERY_TEMPLATE: forLabel
                ? 'SUBQUERY_RLA_LABEL'
                : 'SUBQUERY_RLA_INFORMATION_SOURCE',
            VALUES: [labelSource, ...notInValues],
        });
    }

    if (addNoLabel) {
        let values = [labelSource];
        for (let c of array) {
            if (c.id != 'NO_LABEL') values.push(c.id);
        }
        whitelist.SUBQUERIES.push({
            QUERY_TEMPLATE: 'SUBQUERY_RLA_NO_LABEL',
            VALUES: values,
        });
    }

    if (whitelist.SUBQUERIES.length > 0)
        return JSON.stringify(whitelist);
    if (blacklist.SUBQUERIES.length > 0)
        return JSON.stringify(blacklist);
    return null;
}

function appendBlackAndWhiteListLabelingTaskForConfidence(
    appendTo: string[],
    confidence,
    labelIds: string[],
    forWeakSupervision: boolean = true
): any {
    if (!confidence.active) return;

    const source = forWeakSupervision ? LabelSource.WEAK_SUPERVISION : LabelSource.MODEL_CALLBACK;
    let whitelist = {
        SUBQUERY_TYPE: 'WHITELIST',
        SUBQUERIES: [{
            QUERY_TEMPLATE: 'SUBQUERY_RLA_LABEL',
            VALUES: [source, ...labelIds],
        }],
    };
    appendTo.push(JSON.stringify(whitelist));
    // add confidence filter
    let list = {
        SUBQUERY_TYPE: confidence.negate ? 'BLACKLIST' : 'WHITELIST',
        SUBQUERIES: [],
    };

    const query = forWeakSupervision ? 'SUBQUERY_RLA_CONFIDENCE' : 'SUBQUERY_CALLBACK_CONFIDENCE';
    list.SUBQUERIES.push({
        QUERY_TEMPLATE: query,
        VALUES: [confidence.lower * 0.01, confidence.upper * 0.01],
    });

    return JSON.stringify(list);
}

function appendBlackAndWhiteListUser(appendTo, searchElement, drillDownVal) {
    return appendBlackAndWhiteListUserForArray(appendTo, searchElement.users, drillDownVal);
}

function appendBlackAndWhiteListUserForArray(
    appendTo: string[],
    array: any[],
    drillDown: boolean = false
): any {
    if (drillDown) {
        for (const l of array) {
            appendTo.push(appendBlackAndWhiteListUserForArray(appendTo, [l], false));
        }
        return;
    }

    let whitelist = {
        SUBQUERY_TYPE: 'WHITELIST',
        SUBQUERIES: [],
    };
    let blacklist = {
        SUBQUERY_TYPE: 'BLACKLIST',
        SUBQUERIES: [],
    };
    let inValues = [],
        notInValues = [];
    for (let c of array) {
        if (c.active) {
            if (c.negate) notInValues.push(c.id);
            else inValues.push(c.id);
        }
    }

    if (inValues.length != 0) {
        whitelist.SUBQUERIES.push({
            QUERY_TEMPLATE: 'SUBQUERY_RLA_CREATED_BY',
            VALUES: inValues,
        });
    }
    if (notInValues.length != 0) {
        blacklist.SUBQUERIES.push({
            QUERY_TEMPLATE: 'SUBQUERY_RLA_CREATED_BY',
            VALUES: notInValues,
        });
    }
    if (whitelist.SUBQUERIES.length > 0)
        return JSON.stringify(whitelist);
    if (blacklist.SUBQUERIES.length > 0)
        return JSON.stringify(blacklist);
    return appendTo;
}


function appendActiveOrderBy(values, orderBy) {
    for (const element of values.orderBy) {
        if (!element.active) continue;
        let key = element.orderByKey;
        if (element.isAttribute) key = "RECORD_DATA@" + key;
        if (!orderBy.ORDER_BY.includes(key)) {
            orderBy.ORDER_BY.push(key);
            if (key == StaticOrderByKeys.RANDOM) {
                orderBy.ORDER_DIRECTION.push(element.seedString)
            } else {
                orderBy.ORDER_DIRECTION.push(
                    element.direction == 1 ? 'ASC' : 'DESC');
            }

        }
    }
    return orderBy.ORDER_BY;
}

function appendBlackAndWhiteListComments(appendTo: string[], searchElement: any, user): any {
    const hasCommentsObj = searchElement.values.hasComments;
    let element = {
        SUBQUERY_TYPE: hasCommentsObj.negate ? 'BLACKLIST' : 'WHITELIST',
        SUBQUERIES: [{
            QUERY_TEMPLATE: 'SUBQUERY_HAS_COMMENTS',
            VALUES: [user.id],
        }],
    };
    return hasCommentsObj.active ? JSON.stringify(element) : appendTo;
}

function buildFilterRecordCategory(first: boolean) {
    const filterValue = "SCALE";
    let filterElement = {
        RELATION: first ? 'NONE' : 'AND',
        NEGATION: false,
        TARGET_TABLE: 'RECORD',
        TARGET_COLUMN: 'CATEGORY',
        OPERATOR: SearchOperator.EQUAL,
        VALUES: [filterValue],
    };

    return filterElement;
}