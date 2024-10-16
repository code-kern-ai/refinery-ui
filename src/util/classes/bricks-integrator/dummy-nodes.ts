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

export function getDummyNodeByIdForApi(id: DummyNodes): any {
    const baseNode: any = {
        data: {
            attributes: {
                name: null,
                description: null,
                updatedAt: null,
                sourceCode: null,
                issueId: null,
                inputExample: null,
                endpoint: null,
                moduleType: null
            },
            id: id
        },
        meta: {}
    }
    switch (id) {
        case DummyNodes.CODE_TESTER:
            baseNode.data.attributes.name = "Code tester";
            baseNode.data.attributes.description = "Lets you test random code for the integrator (only available for kern admins)";
            return baseNode;
        case DummyNodes.CODE_PARSER:
            baseNode.data.attributes.name = "Code parser";
            baseNode.data.attributes.description = "Lets you parse random code to the new structure (only available for kern admins)";
            return baseNode;
        case DummyNodes.REFACTOR_TESTER:
            baseNode.data.attributes.name = "Refactor tester";
            baseNode.data.attributes.description = "Lets you test the new structure with dummy data from vader sentiment (only available for kern admins)";
            baseNode.data.attributes.availableFor = ["refinery"];
            baseNode.data.attributes.sourceCode = DUMMY_CODE_VADER;
            baseNode.data.attributes.partOfGroup = ["sentiment"];
            baseNode.data.attributes.integratorInputs = {
                "name": "vader_sentiment",
                "refineryDataType": "text",
                "variables": {
                    "ATTRIBUTE": {
                        "selectionType": SelectionType.CHOICE,
                        "optional": "false",
                        "addInfo": [
                            BricksVariableType.ATTRIBUTE.toLowerCase(),
                            BricksVariableType.GENERIC_STRING.toLowerCase()
                        ]
                    },
                    "MODE": {
                        "selectionType": SelectionType.CHOICE,
                        "defaultValue": "classification",
                        allowedValues: ["classification", "scores"],
                        "description": "choose \"scores\" to only get the sentiment scores as floats",
                        "optional": "false",
                        "addInfo": [
                            BricksVariableType.GENERIC_STRING.toLowerCase()
                        ]
                    },
                    "MIN_SCORE": {
                        "selectionType": SelectionType.RANGE,
                        "defaultValue": 100,
                        "allowedValueRange": [0, 100],
                        "description": "The lowest possible sentiment score.",
                        "addInfo": [BricksVariableType.GENERIC_INT],
                        "optional": "false",
                    },
                }
            }
            return baseNode;
    }
}

const DUMMY_CODE_VADER = `from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

ATTRIBUTE: str = "text" # only text attributes
MODE: str = "classification" # choose "scores" to only get the sentiment scores as floats
MIN_SCORE:int = 100

def vader_sentiment(record):
    analyzer = SentimentIntensityAnalyzer()
    text = record[ATTRIBUTE].text

    vs = analyzer.polarity_scores(text)
    if MODE == "classification":
        if vs["compound"] >= 0.05:
            return "positive"
        elif vs["compound"] > -0.05: 
            return "neutral"
        elif vs["compound"] <= -0.05:
            return "negative"
    elif MODE == "scores": 
        return vs`;
