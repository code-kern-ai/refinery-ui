import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { AttributeCalculationExamples, AttributeCodeLookup } from "@/src/util/classes/attribute-calculation";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { parseLogData } from "@/submodules/javascript-functions/logs-parser";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";
import { Record } from "@/src/types/components/projects/projectId/settings/attribute-calculation";

export function postProcessCurrentAttribute(attribute: Attribute): Attribute {
    if (!attribute) return null;
    const prepareAttribute = jsonCopy(attribute);
    prepareAttribute.logs = parseLogData(prepareAttribute.logs);
    prepareAttribute.progress = Number(prepareAttribute.progress?.toFixed(2));
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
    return prepareAttribute;
}

export function postProcessRecordByRecordId(record: Record): Record {
    const prepareRecord = jsonCopy(record);
    prepareRecord.data = JSON.parse(prepareRecord.data);
    return prepareRecord;
}