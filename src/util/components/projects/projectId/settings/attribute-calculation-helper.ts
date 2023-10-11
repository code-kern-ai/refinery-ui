import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { AttributeCalculationExamples, AttributeCodeLookup } from "@/src/util/classes/attribute-calculation";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { getPythonFunctionRegExMatch } from "@/submodules/javascript-functions/python-functions-parser";

export function postProcessCurrentAttribute(attribute: Attribute) {
    if (!attribute) return null;
    const prepareAttribute = jsonCopy(attribute);
    if (attribute.sourceCode == null) {
        prepareAttribute.sourceCode = AttributeCodeLookup.getAttributeCalculationTemplate(AttributeCalculationExamples.AC_EMPTY_TEMPLATE, prepareAttribute.dataType).code;
        const regMatch: any = getPythonFunctionRegExMatch(prepareAttribute.sourceCode);
        prepareAttribute.sourceCode = prepareAttribute.sourceCode.replace(regMatch[2], prepareAttribute.name);
    } else {
        const regMatch: any = getPythonFunctionRegExMatch(prepareAttribute.sourceCode);
        if (regMatch[2] !== prepareAttribute.name) {
            prepareAttribute.sourceCode = prepareAttribute.sourceCode.replace(regMatch[2], prepareAttribute.name);
        }
    }
    return prepareAttribute;
}