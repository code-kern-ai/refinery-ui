import { Attribute, AttributeVisibility } from "@/src/types/components/projects/projectId/settings";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export const ATTRIBUTES_VISIBILITY_STATES = [
    { name: 'Do not hide', value: AttributeVisibility.DO_NOT_HIDE },
    { name: 'Hide on data browser', value: AttributeVisibility.HIDE_ON_DATA_BROWSER },
    { name: 'Hide on labeling page', value: AttributeVisibility.HIDE_ON_LABELING_PAGE },
    { name: 'Hide', value: AttributeVisibility.HIDE },
];

export function getTooltipVisibilityState(state: AttributeVisibility): string {
    switch (state) {
        case AttributeVisibility.DO_NOT_HIDE:
            return 'The attribute is visible on all pages.';
        case AttributeVisibility.HIDE_ON_LABELING_PAGE:
            return 'The attribute is hidden on labeling page and data browser.';
        case AttributeVisibility.HIDE_ON_DATA_BROWSER:
            return 'The attribute is hidden on data browser, but not on labeling page.';
        case AttributeVisibility.HIDE:
            return 'The attribute is hidden on all pages.';
    }
    return 'UNKNOWN';
}

export const DATA_TYPES = [
    { name: 'Category', value: 'CATEGORY' },
    { name: 'Text', value: 'TEXT' },
    { name: 'Integer', value: 'INTEGER' },
    { name: 'Float', value: 'FLOAT' },
    { name: 'Boolean', value: 'BOOLEAN' },
    { name: 'Embedding List', value: 'EMBEDDING_LIST' },
];

export function postProcessingAttributes(attributes: Attribute[]): Attribute[] {
    const preparedAttributes: Attribute[] = jsonCopy(attributes);
    preparedAttributes.forEach((attribute: any) => {
        attribute.dataTypeName = DATA_TYPES.find((type) => type.value === attribute?.dataType).name;
        attribute.visibilityIndex = ATTRIBUTES_VISIBILITY_STATES.findIndex((type) => type.value === attribute?.visibility);
    });
    return preparedAttributes;
}

