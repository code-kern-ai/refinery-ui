import { SearchItemType } from "@/src/types/components/projects/projectId/data-browser/search-groups";
import { getAttributeType } from "./search-operators-helper";
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { SearchGroup, StaticOrderByKeys } from "@/submodules/javascript-functions/enums/enums";
import { getOrderByDisplayName } from "@/submodules/javascript-functions/enums/enum-functions";
import { HighlightSearch } from "@/src/types/shared/highlight";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export function updateSearchParameters(searchElement, attributes, separator, fullSearch) {
    const activeParams = [];
    searchElement.forEach(p => {
        let param = null;
        if (p.value.group == SearchGroup.ATTRIBUTES) {
            for (let i of p.groupElements) {
                if (!i.active) return;
                param = createSplittedText(updateSearchParamText(i, attributes, separator), fullSearch, p);
                activeParams.push({ splittedText: param, values: i })
            }
        } else if (p.value.group == SearchGroup.COMMENTS) {
            if (!p.groupElements.hasComments.active) return;
            param = createSplittedText(updateSearchParamText(p, attributes, separator), fullSearch, p);
            activeParams.push({ splittedText: param, values: p.groupElements });
        } else if (p.value.key == SearchGroup.USER_FILTER) {
            for (let i of p.groupElements.users) {
                if (!i.active) return;
                param = createSplittedText(updateSearchParamText(p, attributes, separator), fullSearch, p);
                activeParams.push({ splittedText: param, values: { group: p.value.group }, users: p.groupElements.users });
            }
        } else if (p.value.group == SearchGroup.ORDER_STATEMENTS) {
            for (let i of p.groupElements.orderBy) {
                if (!i.active) continue;
                param = createSplittedText(updateSearchParamText(p, attributes, separator), fullSearch, p);
                activeParams.push({ splittedText: param, values: { group: p.value.group, orderBy: p.groupElements } });
            }
        }
        else if (p.value.group == SearchGroup.LABELING_TASKS) {
            if (!p.groupElements.active) return;
            param = createSplittedText(updateSearchParamText(p, attributes, separator, fullSearch[p.value.key].nameAdd), fullSearch, p);
            activeParams.push({ splittedText: param, values: { group: p.value.group, values: p.groupElements } });
        }
    });
    return activeParams;
}

function createSplittedText(i, searchGroup, p) {
    let groupName = null;
    if (p.value.key == SearchItemType.ATTRIBUTE) {
        groupName = searchGroup[p.value.key].groupElements[0].nameAdd + ':';
    } else {
        groupName = searchGroup[p.value.key].groupElements.nameAdd + ':';
    }
    i.searchTextReplaced = i.searchText.replaceAll("\nAND", "\n<gn>" + groupName + "\n");
    i.splittedText = i.searchTextReplaced.split("\n<gn>");
    return i.splittedText;
}


function updateSearchParamText(searchElement, attributes, separator, nameAdd?) {
    const searchElementCopy = jsonCopy(searchElement);
    if (searchElementCopy.type == SearchItemType.ATTRIBUTE) {
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
    } else if (searchElementCopy.value.group == SearchGroup.LABELING_TASKS) {
        searchElementCopy.searchText = nameAdd + labelingTaskBuildSearchParamText(searchElementCopy.groupElements);
    } else if (searchElementCopy.value.group == SearchGroup.USER_FILTER) {
        searchElementCopy.searchText = userBuildSearchParamText(searchElementCopy.groupElements.users);
    } else if (searchElementCopy.value.group == SearchGroup.ORDER_STATEMENTS) {
        searchElementCopy.searchText = orderByBuildSearchParamText(searchElementCopy.groupElements);
    } else if (searchElementCopy.value.group == SearchGroup.COMMENTS) {
        searchElementCopy.searchText = commentsBuildSearchParamText(searchElementCopy.groupElements);
    }
    return searchElementCopy;
}

function labelingTaskBuildSearchParamText(values): string {
    let text = '';

    let tmp = labelingTaskBuildSearchParamTextPart(values.manualLabels, 'M-label');
    if (tmp) text += '(' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.weakSupervisionLabels, 'WS-label');
    if (tmp) text += (text ? '\nAND ' : '') + ' (' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.modelCallbackLabels, 'MC-label');
    if (tmp) text += (text ? '\nAND ' : '') + ' (' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.heuristics, 'IS');
    if (tmp) text += (text ? '\nAND ' : '') + ' (' + tmp + ')';

    if (values.isWithDifferentResults.active) {
        text += (text ? '\nAND ' : '') + ' (mixed IS results)';
    }

    if (values.weakSupervisionConfidence.active) {
        text += (text ? '\nAND ' : '') + 'WS-Confidence '
        if (values.weakSupervisionConfidence.negate) text += "NOT "
        text += "BETWEEN " + values.weakSupervisionConfidence.lower + "% AND " + values.weakSupervisionConfidence.upper + "%";
    }
    if (values.modelCallbackConfidence.active) {
        text += (text ? '\nAND ' : '') + 'MC-Confidence '
        if (values.modelCallbackConfidence.negate) text += "NOT "
        text += "BETWEEN " + values.modelCallbackConfidence.lower + "% AND " + values.modelCallbackConfidence.upper + "%";
    }
    if (values.negate) text = '\nNOT (' + text + ')';
    else text = '\n' + text;
    return text;
}

function labelingTaskBuildSearchParamTextPart(arr: any[], blockname: string): string {
    const drillDown: boolean = false
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

function userBuildSearchParamText(values) {
    let text = labelingTaskBuildSearchParamTextPart(values, 'User');
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
            return { searchFor: '^' + searchValue, matchCase: searchElement.values.caseSensitive }
        case SearchOperator.ENDS_WITH:
            return { searchFor: searchValue + '$', matchCase: searchElement.values.caseSensitive };
        case SearchOperator.CONTAINS:
            return { searchFor: searchValue, matchCase: searchElement.values.caseSensitive };
    }
    return null;
}