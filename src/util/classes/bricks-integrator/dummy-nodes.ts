import { BricksVariableType, SelectionType } from "@/src/types/shared/bricks-integrator";
import { User } from "@/src/types/shared/general";

export enum DummyNodes {
    CODE_TESTER = -1,
    CODE_PARSER = -2,
    REFACTOR_TESTER = -3
}

export function getSelectionType(type: BricksVariableType, asPythonEnum: boolean) {
    switch (type) {
        case BricksVariableType.ATTRIBUTE:
        case BricksVariableType.GENERIC_STRING:
        case BricksVariableType.EMBEDDING:
        case BricksVariableType.LABEL:
        case BricksVariableType.LABELING_TASK:
        case BricksVariableType.LOOKUP_LIST:
            if (asPythonEnum) return "SelectionType.CHOICE.value";
            else return SelectionType.CHOICE;
        case BricksVariableType.LANGUAGE:
        case BricksVariableType.REGEX:
            if (asPythonEnum) return "SelectionType.STRING.value";
            else return SelectionType.STRING;
        case BricksVariableType.GENERIC_INT:
            if (asPythonEnum) return "SelectionType.INT.value";
            else return SelectionType.STRING;
        case BricksVariableType.GENERIC_FLOAT:
            if (asPythonEnum) return "SelectionType.FLOAT.value";
            else return SelectionType.STRING;
        case BricksVariableType.GENERIC_BOOLEAN:
            if (asPythonEnum) return "SelectionType.BOOLEAN.value";
            else return SelectionType.STRING;
    }
    return null;
}

export function getAddInfo(type: BricksVariableType, asPythonEnum: boolean): string[] {
    const list = [];
    switch (type) {
        case BricksVariableType.ATTRIBUTE:
        case BricksVariableType.EMBEDDING:
        case BricksVariableType.LABEL:
        case BricksVariableType.LABELING_TASK:
        case BricksVariableType.LOOKUP_LIST:
            if (asPythonEnum) list.push("BricksVariableType.GENERIC_STRING.value");
            else list.push(BricksVariableType.GENERIC_STRING.toLowerCase());
            break;
    }

    if (asPythonEnum) list.unshift("BricksVariableType." + type + ".value");
    else list.unshift(type.toLowerCase());
    return list;
}

// TODO: Remove this when grdp is removed from bricks
export const GROUPS_TO_REMOVE = ['gdpr_compliant', 'not_gdpr_compliant'];

function getDummyNodeByIdForSelection(id: DummyNodes, extendedIntegrator: boolean): any {
    const baseNode: any = {
        id: id,
        attributes: {
            name: null,
            description: null,
            moduleType: "any",
            dataType: "text",
            sourceCode: null,
        },
        visible: true
    }
    switch (id) {
        case DummyNodes.CODE_TESTER:
            baseNode.attributes.name = "Code tester";
            baseNode.attributes.description = "Lets you test random code for the integrator (only available for kern admins)";
            if (extendedIntegrator) {
                baseNode.attributes.availableFor = ["refinery"];
                baseNode.attributes.partOfGroup = ["admin"];
            }
            return baseNode;
        case DummyNodes.CODE_PARSER:
            baseNode.attributes.name = "Code parser";
            baseNode.attributes.description = "Lets you parse random code to the new structure (only available for kern admins)";
            if (extendedIntegrator) {
                baseNode.attributes.availableFor = ["refinery"];
                baseNode.attributes.partOfGroup = ["admin"];
            }
            return baseNode;
        case DummyNodes.REFACTOR_TESTER:
            baseNode.attributes.name = "Refactor tester";
            baseNode.attributes.description = "Lets you test the new structure with dummy data from vader sentiment (only available for kern admins)";
            // baseNode.attributes.sourceCode = DUMMY_CODE_VADER;
            baseNode.attributes.availableFor = ["refinery"];
            baseNode.attributes.partOfGroup = ["sentiment"];

            return baseNode;


    }
}

export function extendDummyElements(finalData: any[], extendedIntegrator: boolean, user: User, isAdmin: boolean) {
    if (!isAdmin) return;
    addElementToList(finalData, getDummyNodeByIdForSelection(DummyNodes.CODE_TESTER, extendedIntegrator), user);
    addElementToList(finalData, getDummyNodeByIdForSelection(DummyNodes.CODE_PARSER, extendedIntegrator), user);
    // addElementToList(finalData, getDummyNodeByIdForSelection(DummyNodes.REFACTOR_TESTER));
}

function addElementToList(finalData: any[], element: any, user: User) {
    if (user.firstName.toLowerCase() == "jens") finalData.unshift(element);
    else finalData.push(element);
}