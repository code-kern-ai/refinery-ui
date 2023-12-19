import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { jsonCopy } from "@/submodules/javascript-functions/general";

export function postProcessRecord(record: any, attributes: Attribute[]) {
    const prepareRecord = jsonCopy(record);
    if (!prepareRecord.hasOwnProperty('data')) {
        if (prepareRecord.hasOwnProperty('fullRecordData')) {
            prepareRecord.data = prepareRecord.fullRecordData;
        }
        else if (prepareRecord.hasOwnProperty('recordData')) {
            prepareRecord.data = prepareRecord.recordData;
        } else {
            throw new Error("Cant find record data in record object");
        }
    }
    attributes.forEach((attribute, index) => {
        if (typeof prepareRecord.data[attribute.name] === 'boolean') {
            prepareRecord.data[attribute.name] = prepareRecord.data[attribute.name].toString();
        }
    });
    return prepareRecord;
}

export function postProcessAttributes(attributes: Attribute[]) {
    const prepareAttributes = jsonCopy(attributes);
    if (!attributes[0].hasOwnProperty('key')) {
        prepareAttributes.forEach((attribute, index) => {
            if (attribute.id !== null) {
                attribute.key = attribute.id;
            } else {
                throw new Error("Cant find attribute id in attribute object");
            }
        });
    }
    return prepareAttributes;
}