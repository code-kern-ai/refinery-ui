import { getAttributeType } from "./search-operators-helper";
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { SearchGroup, StaticOrderByKeys } from "@/submodules/javascript-functions/enums/enums";
import { getOrderByDisplayName } from "@/submodules/javascript-functions/enums/enum-functions";
import { HighlightSearch } from "@/src/types/shared/highlight";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { addGroupToSearchElement } from "./prefill-values-helper";

export function updateSearchParameters(searchElement, attributes, separator, fullSearch, searchGroup, labelingTasks?) {
    const activeParams = [];
    searchElement.forEach(p => {
        let param = null;
        if (!p.hasOwnProperty('groupElements')) return;
        if (!p.groupElements.group) {
            if (!(Array.isArray(p.groupElements) && p.groupElements[0].group)) {
                p = addGroupToSearchElement(p, labelingTasks);
            }
        }
        if (Array.isArray(p.groupElements) && p.groupElements[0].group == SearchGroup.ATTRIBUTES) {
            for (let i of p.groupElements) {
                if (!i.active) return;
                param = createSplittedText(updateSearchParamText(i, attributes, separator, fullSearch[SearchGroup.DRILL_DOWN]), fullSearch, p);
                activeParams.push({ splittedText: param, values: i })
            }
        }
        else if (p.groupElements.group == SearchGroup.COMMENTS) {
            if (!p.groupElements.hasComments.active) return;
            param = createSplittedText(updateSearchParamText(p, attributes, separator, fullSearch[SearchGroup.DRILL_DOWN]), fullSearch, p);
            activeParams.push({ splittedText: param, values: p.groupElements });
        } else if (p.groupElements.group == SearchGroup.USER_FILTER) {
            for (let i of p.groupElements.users) {
                if (!i.active) continue;
                param = createSplittedText(updateSearchParamText(p, attributes, separator, fullSearch[SearchGroup.DRILL_DOWN]), fullSearch, p);
                activeParams.push({ splittedText: param, values: { group: p.groupElements.group }, users: p.groupElements.users });
            }
        } else if (p.groupElements.group == SearchGroup.ORDER_STATEMENTS) {
            for (let i of p.groupElements.orderBy) {
                if (!i.active) continue;
                param = createSplittedText(updateSearchParamText(p, attributes, separator, fullSearch[SearchGroup.DRILL_DOWN]), fullSearch, p);
                activeParams.push({ splittedText: param, values: { group: p.groupElements.group, orderBy: p.groupElements } });
            }
        } else if (p.groupElements.group == SearchGroup.LABELING_TASKS) {
            if (!(p.groupElements.active || (p.groupElements['weakSupervisionConfidence'] && p.groupElements['weakSupervisionConfidence'].active) || (p.groupElements['modelCallbackConfidence'] && p.groupElements['modelCallbackConfidence'].active) || p.groupElements['isWithDifferentResults'])) return;
            param = createSplittedText(updateSearchParamText(p, attributes, separator, fullSearch[SearchGroup.DRILL_DOWN]), fullSearch, p);
            if (!param) return;
            activeParams.push({ splittedText: param, values: { group: p.groupElements.group, values: p.groupElements } });
        }
    });
    return activeParams;
}

function createSplittedText(i, searchGroup, p) {
    let groupName = null;
    if (Array.isArray(p.groupElements)) {
        groupName = searchGroup[p.groupElements[0].groupKey]?.nameAdd + ':';
    } else {
        groupName = searchGroup[p.groupElements.groupKey]?.nameAdd + ':';
    }
    if (i.searchText == null) return null;
    i.searchTextReplaced = i.searchText.replaceAll("\nAND", "\n<gn>" + groupName + "\n");
    i.splittedText = i.searchTextReplaced.split("\n<gn>");
    return i.splittedText;
}


function updateSearchParamText(searchElement, attributes, separator, drillDownVal) {
    const searchElementCopy = jsonCopy(searchElement);
    if (searchElementCopy.group == SearchGroup.ATTRIBUTES) {
        const attributeType = getAttributeType(attributes, searchElementCopy.name);
        if (searchElementCopy.operator == SearchOperator.BETWEEN) {
            if (attributeType == "INTEGER" || attributeType == "FLOAT") {
                searchElementCopy.searchText =
                    searchElementCopy.name +
                    ' ' +
                    searchElementCopy.operator +
                    " " +
                    searchElementCopy.searchValue +
                    "" + " AND " + searchElementCopy.searchValueBetween;
            } else {
                searchElementCopy.searchText =
                    searchElementCopy.name +
                    ' ' +
                    searchElementCopy.operator +
                    " '" +
                    searchElementCopy.searchValue +
                    "'" + " AND '" + searchElementCopy.searchValueBetween + "'";
            }
        } else if (searchElementCopy.operator == '') {
            searchElementCopy.searchText = searchElementCopy.name;
        } else if (searchElementCopy.operator == SearchOperator.IN || searchElementCopy.operator == "IN WC" || searchElementCopy.operator == SearchOperator.IN_WC) {
            if (attributeType == "INTEGER" || attributeType == "FLOAT") {
                searchElementCopy.searchText =
                    searchElementCopy.name +
                    ' ' +
                    searchElementCopy.operator.split('_').join(' ') +
                    " (" +
                    searchElementCopy.searchValue + ")";
            } else {
                const splitTextBySeparator = searchElementCopy.searchValue.split(separator).filter(i => i);
                searchElementCopy.searchText = searchElementCopy.name + ' ' + searchElementCopy.operator + " (" + splitTextBySeparator.map(x => "'" + x + "'").join(", ") + ")";
            }
        }
        else {
            if (attributeType == "INTEGER" || attributeType == "FLOAT") {
                searchElementCopy.searchText =
                    searchElementCopy.name +
                    ' ' +
                    searchElementCopy.operator +
                    " " +
                    searchElementCopy.searchValue;
            }
            else {
                searchElementCopy.searchText =
                    searchElementCopy.name +
                    ' ' +
                    searchElementCopy.operator +
                    " '" +
                    searchElementCopy.searchValue +
                    "'";
            }
        }
        if (searchElementCopy.negate)
            searchElementCopy.searchText = 'NOT (' + searchElementCopy.searchText + ')';
        if (separator == "-")
            searchElementCopy.searchText = searchElementCopy.searchText.replaceAll("-", ",");
    } else if (searchElementCopy.groupElements.group == SearchGroup.LABELING_TASKS) {
        searchElementCopy.searchText = searchElement.nameAdd + labelingTaskBuildSearchParamText(searchElementCopy.groupElements, drillDownVal);
        if (labelingTaskBuildSearchParamText(searchElementCopy.groupElements, drillDownVal) === '') {
            searchElementCopy.searchText = null;
        }
    } else if (searchElementCopy.groupElements.group == SearchGroup.USER_FILTER) {
        searchElementCopy.searchText = userBuildSearchParamText(searchElementCopy.groupElements.users, drillDownVal);
    } else if (searchElementCopy.groupElements.group == SearchGroup.ORDER_STATEMENTS) {
        searchElementCopy.searchText = orderByBuildSearchParamText(searchElementCopy.groupElements);
    } else if (searchElementCopy.groupElements.group == SearchGroup.COMMENTS) {
        searchElementCopy.searchText = commentsBuildSearchParamText(searchElementCopy.groupElements);
    }
    return searchElementCopy;
}

function labelingTaskBuildSearchParamText(values, drillDownVal): string {
    let text = '';

    let tmp = labelingTaskBuildSearchParamTextPart(values.manualLabels, 'M-label', drillDownVal);
    if (tmp) text += '(' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.weakSupervisionLabels, 'WS-label', drillDownVal);
    if (tmp) text += (text ? '\nAND ' : '') + ' (' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.modelCallbackLabels, 'MC-label', drillDownVal);
    if (tmp) text += (text ? '\nAND ' : '') + ' (' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.heuristics, 'IS', drillDownVal);
    if (tmp) text += (text ? '\nAND ' : '') + ' (' + tmp + ')';

    if (values.isWithDifferentResults.active) {
        text += (text ? '\nAND ' : '') + ' (mixed IS results)';
    }

    if (values.weakSupervisionConfidence && values.weakSupervisionConfidence.active) {
        text += (text ? '\nAND ' : '') + 'WS-Confidence '
        if (values.weakSupervisionConfidence.negate) text += "NOT "
        text += "BETWEEN " + values.weakSupervisionConfidence.lower + "% AND " + values.weakSupervisionConfidence.upper + "%";
    }

    if (values.modelCallbackConfidence && values.modelCallbackConfidence.active) {
        text += (text ? '\nAND ' : '') + 'MC-Confidence '
        if (values.modelCallbackConfidence.negate) text += "NOT "
        text += "BETWEEN " + values.modelCallbackConfidence.lower + "% AND " + values.modelCallbackConfidence.upper + "%";
    }
    if (values.negate) text = '\nNOT (' + text + ')';
    else text = '\n' + text;
    if (text === '\n') return '';
    return text;
}

function labelingTaskBuildSearchParamTextPart(arr: any[], blockname: string, drillDownVal: boolean): string {
    if (!arr) return '';
    const drillDown: boolean = drillDownVal;
    let text = '';
    let in_values = '';
    let not_in_values = '';
    const connector = drillDown ? ' AND ' : ', '
    const operatorPositive = drillDown ? ' HAS ' : ' IN '
    const operatorNegative = drillDown ? ' DOESN\'T HAVE ' : ' NOT IN '
    for (let c of arr) {
        if (c.active) {
            if (c.negate) not_in_values += (not_in_values ? connector : '') + c.name;
            else in_values += (in_values ? connector : '') + c.name;
        }
    }
    if (in_values || not_in_values) {
        text = blockname;
        if (in_values)
            text += operatorPositive + '(' + in_values + ')' + (not_in_values ? ' AND ' : '');
        if (not_in_values) text += operatorNegative + '(' + not_in_values + ')';
    }

    return text;
}

function userBuildSearchParamText(values, drillDownVal) {
    let text = labelingTaskBuildSearchParamTextPart(values, 'User', drillDownVal);
    if (values.negate) text = 'NOT (' + text + ')';
    return text;
}

function orderByBuildSearchParamText(values): string {
    let text = '';
    for (const element of values.orderBy) {
        if (element.active) {
            if (text) text += "\n";
            else text = "ORDER BY "
            text += element.displayName;
            if (element.displayName != getOrderByDisplayName(StaticOrderByKeys.RANDOM)) {
                text += (element.direction == 1 ? ' ASC' : ' DESC');
            } else {
                text += ' (seed:' + element.seedString + ')';
            }
        }
    }
    return text;
}

function commentsBuildSearchParamText(values): string {
    return values.hasComments.negate ? 'NO COMMENTS' : 'HAS COMMENTS';
}

export function getRegexFromFilter(searchElement): HighlightSearch {
    if (searchElement.values.negate) return null; //would highlight everything
    let searchValue = searchElement.values.searchValue;
    searchValue = searchValue.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    switch (searchElement.values.operator) {
        case SearchOperator.EQUAL:
            return { searchFor: '^' + searchValue + '$', matchCase: searchElement.values.caseSensitive };
        case SearchOperator.BEGINS_WITH:
        case 'BEGINS WITH':
            return { searchFor: '^' + searchValue, matchCase: searchElement.values.caseSensitive }
        case SearchOperator.ENDS_WITH:
        case 'ENDS WITH':
            return { searchFor: searchValue + '$', matchCase: searchElement.values.caseSensitive };
        case SearchOperator.CONTAINS:
            return { searchFor: searchValue, matchCase: searchElement.values.caseSensitive };
    }
    return null;
}
