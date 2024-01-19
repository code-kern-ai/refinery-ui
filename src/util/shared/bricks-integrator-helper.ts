import { BricksExpectedLabels, BricksIntegratorConfig, BricksVariable, BricksVariableType, IntegratorPage, SelectionType } from "@/src/types/shared/bricks-integrator";
import { capitalizeFirst } from "@/submodules/javascript-functions/case-types-parser";
import { isoCodes, mostRelevant } from "../classes/bricks-integrator/language-iso";

const HTTP_BASE_LINK: string = "https://cms.bricks.kern.ai/api/modules/";
const HTTP_BASE_LINK_EXAMPLE: string = "https://api.bricks.kern.ai/";

export function getEmptyBricksIntegratorConfig(): BricksIntegratorConfig {
    return {
        canAccept: false,
        overviewCodeOpen: false,
        integratorCodeOpen: false,
        integratorParseOpen: true,
        page: IntegratorPage.SEARCH,
        copied: false,
        api: {
            requesting: false,
            moduleId: null,
            requestUrl: null,
            data: null,
        },
        example: {
            requesting: false,
            requestUrl: null,
            requestData: null,
            returnData: null,
        },
        search: {
            requesting: false,
            searchValue: null,
            lastRequestUrl: null,
            requestData: null,
            debounce: null,
            results: [],
            nothingMatches: false,
            currentRequest: null
        },
        codeFullyPrepared: false,
        preparedCode: null,
        preparedJson: null,
        prepareJsonAsPythonEnum: true,
        prepareJsonRemoveYOUR: true,
        extendedIntegrator: false,
        groupFilterOptions: {
            filterValues: {},
            filterValuesArray: []
        },
        extendedIntegratorGroupFilterOpen: false,
        querySourceSelectionOpen: false,
        querySourceSelectionRemote: true,
        querySourceSelectionLocalStrapiPort: 1337,
        querySourceSelectionLocalStrapiToken: "",
        querySourceSelectionLocalBricksPort: 8000,
        extendedIntegratorOverviewAddInfoOpen: false,
        extendedIntegratorNewParse: true,
    }
}

export function getEmptyBricksExpectedLabels(): BricksExpectedLabels {
    return {
        expectedTaskLabels: [],
        labelsToBeCreated: null,
        labelWarning: false,
        canCreateTask: false,
        labelMappingActive: false,
        availableLabels: [],
    }
}

export function canHaveDefaultValue(vType: BricksVariableType): boolean {
    switch (vType) {
        case BricksVariableType.REGEX:
        case BricksVariableType.GENERIC_STRING:
        case BricksVariableType.GENERIC_INT:
        case BricksVariableType.GENERIC_FLOAT:
        case BricksVariableType.GENERIC_BOOLEAN:
        case BricksVariableType.GENERIC_CHOICE:
            return true;
        default: return false;
    }

}

function isSpecialChoiceType(vType: BricksVariableType): boolean {
    switch (vType) {
        case BricksVariableType.ATTRIBUTE:
        case BricksVariableType.LANGUAGE:
        case BricksVariableType.LABELING_TASK:
        case BricksVariableType.LABEL:
        case BricksVariableType.EMBEDDING:
        case BricksVariableType.LOOKUP_LIST:
            return true;
        default: return false;
    }
}

export function getChoiceType(selectionType: SelectionType, addInfo: string[]): BricksVariableType {
    if (selectionType != SelectionType.CHOICE) return BricksVariableType.UNKNOWN;
    if (addInfo.length == 0) return BricksVariableType.GENERIC_CHOICE;

    for (let x of addInfo) {
        const type = x.toUpperCase() as BricksVariableType;
        if (isSpecialChoiceType(type)) return type;
    }

    return BricksVariableType.GENERIC_CHOICE;

}

export function getEmptyBricksVariable(): BricksVariable {
    return {
        line: null,
        replacedLine: null,
        baseName: null,
        displayName: null,
        values: [null],
        allowedValues: null,
        pythonType: null,
        canMultipleValues: false,
        type: null,
        comment: null,
        optional: false,
        options: {}
    }
}

export function bricksVariableNeedsTaskId(variableType: BricksVariableType): boolean {
    switch (variableType) {
        case BricksVariableType.EMBEDDING:
        case BricksVariableType.LABEL:
            return true;
        default:
            return false;
    }
}

export function buildSearchUrl(config: BricksIntegratorConfig, moduleTypeFilter: string, executionTypeFilter: string): string {
    let filter = "?pagination[pageSize]=99999";
    filter += extendUrl(moduleTypeFilter, "moduleType", executionTypeFilter);
    filter += extendUrl(executionTypeFilter, "executionType", executionTypeFilter);
    return getHttpBaseLink(config) + filter;
}

export function getHttpBaseLink(config: BricksIntegratorConfig): string {
    if (config.querySourceSelectionRemote) return HTTP_BASE_LINK;
    else return `http://localhost:${config.querySourceSelectionLocalStrapiPort}/api/modules/`
}

export function getHttpBaseLinkExample(config: BricksIntegratorConfig): string {
    if (config.querySourceSelectionRemote) return HTTP_BASE_LINK_EXAMPLE;
    else return `http://localhost:${config.querySourceSelectionLocalBricksPort}/`
}

function extendUrl(value: string, attribute: string, executionTypeFilter: string): string {
    let filter = "";
    if (!value) return filter += "&filters[executionType][$ne]=activeLearner";
    const splitVal: string[] = value.split(',');
    for (let i = 0; i < splitVal.length; i++) {
        filter += "&filters[" + attribute + "][$eq]=" + splitVal[i].trim();
        filter += filterActiveLearnersFromGenerators(splitVal, i, filter, executionTypeFilter);
    }
    return filter;
}

function filterActiveLearnersFromGenerators(splitVal: string[], index: number, filter: string, executionTypeFilter: string) {
    // Remove active learners from generators (on ac page we have generators and classifiers but we want to exclude active learners there)
    if (splitVal[index].trim() == 'generator' && executionTypeFilter != "activeLearner") {
        filter += "&filters[executionType][$ne]=activeLearner";
    }
    return filter;
}

export function filterMinVersion(data: any[]): any[] {
    if (!data || data.length == 0) return data;
    const el = document.getElementById('refineryVersion') as HTMLElement;
    if (!el) {
        console.log("no refineryVersion element found");
        return data;
    }
    const currentVersion = el.textContent.trim().replace("v", "").split(".").map(e => parseInt(e));
    if (currentVersion.length != 3) {
        console.log("current version is not in correct format");
        return data;
    }
    return data.filter(e => refineryCanHandle(currentVersion, e.attributes.minRefineryVersion));

}

function refineryCanHandle(refineryVersion: number[], brickVersion: string): boolean {
    if (!brickVersion) return true;
    const brickVersionSplit = brickVersion.split(".").map(e => parseInt(e));
    if (brickVersionSplit.length != 3) return false;
    for (let i = 0; i < 3; i++) {
        if (refineryVersion[i] > brickVersionSplit[i]) return true;
        else if (refineryVersion[i] < brickVersionSplit[i]) return false;
        //else continue with next digit
    }
    return true;
}

export function getGroupName(groupKey: string): string {
    switch (groupKey) {
        case "no_api_key": return "No API Key";
        default: return capitalizeFirst(groupKey);
    }
}

export function getIsoCodes(onlyMostRelevant: boolean = true): { code: string, name: string }[] {
    return isoCodes.filter(e => !onlyMostRelevant || mostRelevant.includes(e.code));
}

export function getIconName(bricksIconName: string): string {
    switch (bricksIconName) {
        case "ThreeDCubeSphere": return "3dCubeSphere";
        default: bricksIconName;
    }
}