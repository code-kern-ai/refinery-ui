import { SearchOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";

export function getAttributeType(attributes: any[], attributeName: string) {
    return attributes.find(att => att.name == attributeName)?.type;
}

export function getSearchOperatorTooltip(operator: SearchOperator): string {
    switch (operator) {
        case SearchOperator.EQUAL:
            return '= {value}';
        case SearchOperator.BEGINS_WITH:
            return 'LIKE {value}%';
        case SearchOperator.ENDS_WITH:
            return 'LIKE %{value}';
        case SearchOperator.CONTAINS:
            return 'LIKE %{value}%';
        case SearchOperator.IN:
            return 'Included in separated list of values';
        case SearchOperator.IN_WC:
            return 'Like IN but with wildcard support (*,?,%,_)';
        case SearchOperator.BETWEEN:
            return '>= {a} and <= {b}';
        case SearchOperator.GREATER:
            return '> {value}';
        case SearchOperator.GREATER_EQUAL:
            return '>= {value}';
        case SearchOperator.LESS:
            return '< {value}';
        case SearchOperator.LESS_EQUAL:
            return '<= {value}';
    }
    return 'UNKNOWN';
}

export function checkDecimalPatterns(attributeType: string, event: any, operatorValue: string, separator: string) {
    if (attributeType == "INTEGER" || attributeType == "FLOAT") {
        let pattern;
        if (attributeType == "INTEGER") {
            if (separator == '-') {
                pattern = operatorValue == 'IN' ? /^[0-9-]$/i : operatorValue == 'IN WC' ? /^[0-9_%-*?]$/i : /^[0-9]$/i;
            } else {
                pattern = operatorValue == 'IN' ? /^[0-9,]$/i : operatorValue == 'IN WC' ? /^[0-9,_%*?]$/i : /^[0-9]$/i;
            }

        } else {
            if (separator == '-') {
                pattern = operatorValue == 'IN' ? /^[0-9.-]$/i : operatorValue == 'IN WC' ? /^[0-9._%-*?]$/i : /^[0-9.]$/i;
            } else {
                pattern = operatorValue == 'IN' ? /^[0-9.,]$/i : operatorValue == 'IN WC' ? /^[0-9.,_%*?]$/i : /^[0-9.]$/i;
            }
        }
        if ((event.key == 'Tab' && operatorValue == SearchOperator.BETWEEN)) {
            return;
        }
        if ((event.ctrlKey || event.metaKey) && ['c', 'x', 'v'].includes(event.key.toLowerCase())) {
            return;
        }
        if (!pattern.test(event.key) && event.key != 'Backspace' && event.key != 'ArrowLeft' && event.key != 'ArrowRight') {
            event.preventDefault();
            return;
        }
    }
}