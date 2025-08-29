import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { AttributeCalculationExamples, AttributeCodeLookup } from "@/src/util/classes/attribute-calculation";
import { parseContainerLogsData } from "@/submodules/javascript-functions/logs-parser";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";
import { Record } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { ATTRIBUTES_VISIBILITY_STATES, DATA_TYPES } from "./data-schema-helper";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export function postProcessCurrentAttribute(attribute: Attribute): Attribute {
    if (!attribute) return null;
    const prepareAttribute = { ...attribute };
    prepareAttribute.logs = parseContainerLogsData(prepareAttribute.logs);
    prepareAttribute.progress = Number(prepareAttribute.progress?.toFixed(2));
    prepareAttribute.dataTypeName = DATA_TYPES.find((type) => type.value === attribute?.dataType).name;
    prepareAttribute.visibilityIndex = ATTRIBUTES_VISIBILITY_STATES.findIndex((type) => type.value === attribute?.visibility);
    prepareAttribute.visibilityName = ATTRIBUTES_VISIBILITY_STATES.find((type) => type.value === attribute.visibility).name;
    if (attribute.sourceCode == null) {
        prepareAttribute.sourceCode = AttributeCodeLookup.getAttributeCalculationTemplate(AttributeCalculationExamples.AC_EMPTY_TEMPLATE, prepareAttribute.dataType).code;
        const regMatch: any = getPythonFunctionRegExMatch(prepareAttribute.sourceCode);
        prepareAttribute.sourceCodeToDisplay = prepareAttribute.sourceCode.replace(regMatch[2], prepareAttribute.name);
        prepareAttribute.saveSourceCode = true;
    } else {
        const regMatch: any = getPythonFunctionRegExMatch(prepareAttribute.sourceCode);
        if (regMatch[2] !== prepareAttribute.name) {
            prepareAttribute.sourceCodeToDisplay = prepareAttribute.sourceCode.replace(regMatch[2], prepareAttribute.name);
            prepareAttribute.saveSourceCode = false
        }
    }

    if (prepareAttribute.additionalConfig) {
        prepareAttribute.additionalConfig = jsonCopy(prepareAttribute.additionalConfig);
        if (!prepareAttribute.additionalConfig.llmConfig.apiKey) prepareAttribute.additionalConfig.llmConfig.apiKey = "";
    }

    return prepareAttribute;
}

export function postProcessRecordByRecordId(record: Record): Record {
    if (!record) return null;
    const prepareRecord = { ...record };
    prepareRecord.data = JSON.parse(prepareRecord.data);
    return prepareRecord;
}



export const LLM_PROVIDER_OPTIONS = [
    'Open AI',
    'Azure',
    'Azure Foundry',
    'Privatemode AI'
];

export function postProcessLLMPlaygroundRecordData(recordList: any[]): any[] {
    if (!recordList || recordList.length == 0) return null;
    return recordList.map((record) => {
        const parsed = JSON.parse(record.recordData);
        return ({ ...parsed.data, id: parsed.id });
    });
}