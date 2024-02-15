import {
  FilterIntegrationOperator,
  SearchOperator,
} from '@/src/types/components/projects/projectId/data-browser/search-operators'

export function getAttributeType(attributes: any[], attributeName: string) {
  return attributes.find((att) => att.name == attributeName)?.type
}

export function getSearchOperatorTooltip(operator: SearchOperator): string {
  switch (operator) {
    case SearchOperator.EQUAL:
      return '= {value}'
    case SearchOperator.BEGINS_WITH:
      return 'LIKE {value}%'
    case SearchOperator.ENDS_WITH:
      return 'LIKE %{value}'
    case SearchOperator.CONTAINS:
      return 'LIKE %{value}%'
    case SearchOperator.IN:
      return 'Included in separated list of values'
    case SearchOperator.IN_WC:
      return 'Like IN but with wildcard support (*,?,%,_)'
    case SearchOperator.BETWEEN:
      return '>= {a} and <= {b}'
    case SearchOperator.GREATER:
      return '> {value}'
    case SearchOperator.GREATER_EQUAL:
      return '>= {value}'
    case SearchOperator.LESS:
      return '< {value}'
    case SearchOperator.LESS_EQUAL:
      return '<= {value}'
  }
  return 'UNKNOWN'
}

export function checkDecimalPatterns(
  attributeType: string,
  event: any,
  operatorValue: string,
  separator: string,
) {
  if (attributeType == 'INTEGER' || attributeType == 'FLOAT') {
    let pattern
    if (attributeType == 'INTEGER') {
      if (separator == '-') {
        pattern =
          operatorValue == 'IN'
            ? /^[0-9-]$/i
            : operatorValue == 'IN WC'
              ? /^[0-9_%-*?]$/i
              : /^[0-9]$/i
      } else {
        pattern =
          operatorValue == 'IN'
            ? /^[0-9,]$/i
            : operatorValue == 'IN WC'
              ? /^[0-9,_%*?]$/i
              : /^[0-9]$/i
      }
    } else {
      if (separator == '-') {
        pattern =
          operatorValue == 'IN'
            ? /^[0-9.-]$/i
            : operatorValue == 'IN WC'
              ? /^[0-9._%-*?]$/i
              : /^[0-9.]$/i
      } else {
        pattern =
          operatorValue == 'IN'
            ? /^[0-9.,]$/i
            : operatorValue == 'IN WC'
              ? /^[0-9.,_%*?]$/i
              : /^[0-9.]$/i
      }
    }
    if (event.key == 'Tab' && operatorValue == SearchOperator.BETWEEN) {
      return
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      ['c', 'x', 'v'].includes(event.key.toLowerCase())
    ) {
      return
    }
    if (
      !pattern.test(event.key) &&
      event.key != 'Backspace' &&
      event.key != 'ArrowLeft' &&
      event.key != 'ArrowRight'
    ) {
      event.preventDefault()
      return
    }
  }
}

export function getFilterIntegrationOperatorTooltip(
  operator: FilterIntegrationOperator,
): string {
  switch (operator) {
    case FilterIntegrationOperator.EQUAL:
      return '= {value}'
    case FilterIntegrationOperator.BETWEEN:
      return '>= {a} and <= {b}'
    case FilterIntegrationOperator.IN:
      return 'Included in separated list of values'
  }
  return 'UNKNOWN'
}

export function prepareFilterElements(
  searchElement: any,
  name: string,
  separator: string,
  attributeType: string,
) {
  let values = []
  if (searchElement.values.operator == SearchOperator.BETWEEN) {
    values = [
      name,
      searchElement.values.searchValue,
      searchElement.values.searchValueBetween,
    ]
  } else if (
    searchElement.values.operator == SearchOperator.IN ||
    searchElement.values.operator == SearchOperator.IN_WC
  ) {
    const split = searchElement.values.searchValue
      .split(separator)
      .filter((i) => i)
    values = [name, ...split]
  } else if (searchElement.values.operator == '') {
    searchElement.values.operator = SearchOperator.EQUAL
    values = [
      name,
      searchElement.values.negate
        ? searchElement.values.negate
        : !searchElement.values.negate,
    ]
  } else {
    values = [
      name,
      attributeType != 'BOOLEAN'
        ? searchElement.values.searchValue
        : !searchElement.values.negate,
    ]
  }
  values = parseFilterElements(searchElement, values, attributeType)
  return values
}
export function parseFilterElements(
  searchElement: any,
  values: any,
  attributeType: string,
): any[] {
  if (
    attributeType == 'INTEGER' &&
    searchElement.values.operator != SearchOperator.IN_WC
  ) {
    for (let i = 1; i < values.length; i++) {
      const isNum = /^\d+$/.test(values[i].trim())
      if (!isNum) return null
      else values[i] = parseInt(values[i].trim())
    }
  } else if (
    attributeType == 'FLOAT' &&
    searchElement.values.operator != SearchOperator.IN_WC
  ) {
    for (let i = 1; i < values.length; i++) {
      const isNum = /^(\d+|(\d+\.\d*))$/.test(values[i].trim())
      if (!isNum) return null
      else values[i] = parseFloat(values[i].trim())
    }
  } else {
    values.slice(1, values.length).forEach((value, index) => {
      values[index + 1] = value
    })
  }
  return values
}

export function prepareOperator(
  searchElement: any,
  attributeType: string,
): string {
  if (searchElement.values.caseSensitive) {
    let operator = searchElement.values.operator
    switch (operator) {
      case SearchOperator.BEGINS_WITH:
        operator = 'BEGINS_WITH_CS'
        break
      case SearchOperator.ENDS_WITH:
        operator = 'ENDS_WITH_CS'
        break
      case SearchOperator.CONTAINS:
        operator = 'CONTAINS_CS'
        break
      case SearchOperator.IN_WC:
        operator = 'IN_WC_CS'
        break
    }
    return operator
  }

  if (attributeType == 'BOOLEAN') {
    return SearchOperator.EQUAL
  } else {
    return searchElement.values.operator
  }
}
