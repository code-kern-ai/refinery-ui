import { SearchItemType } from "@/src/types/components/projects/projectId/data-browser/search-groups";
import { getAttributeType } from "./search-operators-helper";
import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { SearchGroup, StaticOrderByKeys } from "@/submodules/javascript-functions/enums/enums";
import { getOrderByDisplayName } from "@/submodules/javascript-functions/enums/enum-functions";

export function updateSearchParameters(searchElement, attributes, separator, searchGroup) {
    const activeParams = [];
    searchElement.forEach(p => {
        let param = null;
        if (p.value.key == SearchGroup.ATTRIBUTES) {
            for (let i of p.groupElements) {
                if (!i.active) return;
                param = createSplittedText(updateSearchParamText(i, attributes, separator), searchGroup, p);
                activeParams.push({ splittedText: param, values: i })
            }
        } else if (p.value.key == SearchGroup.COMMENTS) {
            if (!p.groupElements.hasComments.active) return;
            param = createSplittedText(updateSearchParamText(p, attributes, separator), searchGroup, p);
        }
        // } else {
        //     if (!p.groupElements.active) return;
        //     const searchText = updateSearchParamText(p, attributes, separator);
        //     console.log("searchText", searchText)
        //     param = createSplittedText(searchText, searchGroup);
        //     activeParams.push(param)
        // }
    });
    return activeParams.filter(i => i);
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


function updateSearchParamText(searchElement, attributes, separator) {
    if (searchElement.type == SearchItemType.ATTRIBUTE) {
        const attributeType = getAttributeType(attributes, searchElement.name);
        if (searchElement.operator == SearchOperator.BETWEEN) {
            if (attributeType == "INTEGER" || attributeType == "FLOAT") {
                searchElement.searchText =
                    searchElement.name +
                    ' ' +
                    searchElement.operator +
                    " " +
                    searchElement.searchValue +
                    "" + " AND " + searchElement.searchValueBetween;
            } else {
                searchElement.searchText =
                    searchElement.name +
                    ' ' +
                    searchElement.operator +
                    " '" +
                    searchElement.searchValue +
                    "'" + " AND '" + searchElement.searchValueBetween + "'";
            }
        } else if (searchElement.operator == '') {
            searchElement.searchText = searchElement.name;
        } else if (searchElement.operator == SearchOperator.IN || searchElement.operator == "IN WC" || searchElement.operator == SearchOperator.IN_WC) {
            if (attributeType == "INTEGER" || attributeType == "FLOAT") {
                searchElement.searchText =
                    searchElement.name +
                    ' ' +
                    searchElement.operator.split('_').join(' ') +
                    " (" +
                    searchElement.searchValue + ")";
            } else {
                const splitTextBySeparator = searchElement.searchValue.split(separator).filter(i => i);
                searchElement.searchText = searchElement.name + ' ' + searchElement.operator + " (" + splitTextBySeparator.map(x => "'" + x + "'").join(", ") + ")";
            }
        }
        else {
            if (attributeType == "INTEGER" || attributeType == "FLOAT") {
                searchElement.searchText =
                    searchElement.name +
                    ' ' +
                    searchElement.operator +
                    " " +
                    searchElement.searchValue;
            }
            else {
                searchElement.searchText =
                    searchElement.name +
                    ' ' +
                    searchElement.operator +
                    " '" +
                    searchElement.searchValue +
                    "'";
            }
        }
        if (searchElement.negate)
            searchElement.searchText = 'NOT (' + searchElement.searchText + ')';
        if (separator == "-")
            searchElement.searchText = searchElement.searchText.replaceAll("-", ",");
    } else if (searchElement.value.key == SearchItemType.LABELING_TASK) {
        searchElement.searchText = labelingTaskBuildSearchParamText(searchElement.values);
    } else if (searchElement.value.key == SearchItemType.USER) {
        searchElement.searchText = userBuildSearchParamText(searchElement.values);
    } else if (searchElement.value.key == SearchItemType.ORDER_BY) {
        searchElement.searchText = orderByBuildSearchParamText(searchElement.values);
    } else if (searchElement.value.key == SearchItemType.COMMENTS) {
        searchElement.searchText = commentsBuildSearchParamText(searchElement.groupElements);
    }
    return searchElement;
}

function labelingTaskBuildSearchParamText(values): string {
    let text = '';

    let tmp = labelingTaskBuildSearchParamTextPart(values.manualLabels, 'M-label');
    if (tmp) text += '(' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.weakSupervisionLabels, 'WS-label');
    if (tmp) text += (text ? '\nAND ' : '') + ' (' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.modelCallbackLabels, 'MC-label');
    if (tmp) text += (text ? '\nAND ' : '') + ' (' + tmp + ')';

    tmp = labelingTaskBuildSearchParamTextPart(values.informationSources, 'IS');
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
    // return this.searchGroups.get(values.groupKey).nameAdd + ':' + text;
}

function labelingTaskBuildSearchParamTextPart(arr: any[], blockname: string): string {
    const drillDown: boolean = true
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
    let text = labelingTaskBuildSearchParamTextPart(values.users, 'User');

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