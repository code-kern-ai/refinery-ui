import { Embedding } from "@/src/types/components/projects/projectId/settings/embeddings";
import { getAttributeType } from "./search-operators-helper";
import { DataTypeEnum } from "@/src/types/shared/general";
import { FilterIntegrationOperator } from "@/src/types/components/projects/projectId/data-browser/search-operators";
import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";

export function prepareFilterAttributes(embeddings: Embedding[], embeddingName: string) {
    if (!embeddings || embeddings.length == 0) return null;
    if (embeddingName == '') embeddingName = embeddings[0].name;
    const embedding = embeddings.find(e => e.name == embeddingName);
    if (!embedding) return null;
    if (embedding.filterAttributes && embedding.filterAttributes.length == 0) return null;
    return embedding.filterAttributes;
}

export function filterAttributesSSGroup(filterAttributesSS, operatorsDict, attributes) {
    return {
        name: filterAttributesSS ? filterAttributesSS[0] : '',
        operator: filterAttributesSS ? operatorsDict[filterAttributesSS[0]][0] : '',
        searchValue: '',
        searchValueBetween: '',
        addText: filterAttributesSS ? getPlaceholderText(getAttributeType(attributes, filterAttributesSS[0])) : ''
    }
}

export function getPlaceholderText(attributeType: string) {
    switch (attributeType) {
        case DataTypeEnum.INTEGER:
            return "Enter integer value";
        case DataTypeEnum.FLOAT:
            return "Enter float value";
        default:
            return "Enter value";
    }
}

export function prepareAttFilter(filterAttributesForm: any, attributes: Attribute[]) {
    const filter = [];
    if (filterAttributesForm.length == 0 || !filterAttributesForm[0].name) return JSON.stringify(filter);
    for (let i = 0; i < filterAttributesForm.length; i++) {
        const attribute = filterAttributesForm[i];
        if (attribute.operator !== FilterIntegrationOperator.IN) {
            attribute.searchValue = parseSearchValue(attribute.name, attribute.searchValue, attributes);
        }
        if (attribute.operator === FilterIntegrationOperator.IN) {
            const split = attribute.searchValue.split(",");
            split.forEach((value, index) => {
                split[index] = parseSearchValue(attribute.name, value, attributes);

            });
            attribute.searchValue = split;
            filter.push({ "key": attribute.name, "value": attribute.searchValue });
        } else if (attribute.operator === FilterIntegrationOperator.EQUAL) {
            filter.push({ "key": attribute.name, "value": attribute.searchValue });
        } else if (attribute.operator === FilterIntegrationOperator.BETWEEN) {
            attribute.searchValueBetween = parseSearchValue(attribute.name, attribute.searchValueBetween, attributes);
            const values = [attribute.searchValue, attribute.searchValueBetween];
            filter.push({ "key": attribute.name, "value": values, "type": "between" });
        }
    }
    return JSON.stringify(filter);
}

function parseSearchValue(attributeName: any, value: any, attributes: Attribute[]) {
    const attributeType = getAttributeType(attributes, attributeName);
    if (attributeType == "INTEGER") {
        value = parseInt(value);
    } else if (attributeType == "FLOAT") {
        value = parseFloat(value);
    } else if (attributeType == "BOOLEAN") {
        value = value == "true" ? true : false;
    }
    return value;
}