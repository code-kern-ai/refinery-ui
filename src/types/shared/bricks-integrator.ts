import { Subscription } from "rxjs"

export enum IntegratorPage {
    SEARCH = "SEARCH",
    OVERVIEW = "OVERVIEW",
    INPUT_EXAMPLE = "INPUT_EXAMPLE",
    INTEGRATION = "INTEGRATION",
}

export enum SelectionType {
    STRING = "string",
    CHOICE = "choice",
    RANGE = "range",
}
export enum StringBoolean {
    TRUE = "true",
    FALSE = "false",
}

export enum RefineryDataType {
    CATEGORY = "category",
    TEXT = "text",
    INTEGER = "integer",
    FLOAT = "float",
    BOOLEAN = "boolean",
}

export enum BricksVariableType {
    ATTRIBUTE = "ATTRIBUTE",
    LANGUAGE = "LANGUAGE",
    LABELING_TASK = "LABELING_TASK",
    LABEL = "LABEL",
    EMBEDDING = "EMBEDDING",
    LOOKUP_LIST = "LOOKUP_LIST",
    REGEX = "REGEX",
    GENERIC_STRING = "GENERIC_STRING",
    GENERIC_INT = "GENERIC_INT",
    GENERIC_FLOAT = "GENERIC_FLOAT",
    GENERIC_BOOLEAN = "GENERIC_BOOLEAN",
    GENERIC_CHOICE = "GENERIC_CHOICE",
    GENERIC_RANGE = "GENERIC_RANGE",
    UNKNOWN = "UNKNOWN",
}

export type BricksIntegratorConfig = {
    canAccept: boolean,
    overviewCodeOpen: boolean,
    integratorCodeOpen: boolean,
    integratorParseOpen: boolean,
    page: IntegratorPage,
    copied: boolean,
    api: {
        requesting: boolean,
        moduleId: number,
        requestUrl: string,
        data: BricksAPIData,
    },
    example: {
        requesting: boolean,
        requestUrl: string,
        requestData: string,
        returnData: string,
    },
    search: {
        requesting: boolean,
        searchValue: string,
        lastRequestUrl: string,
        requestData: string,
        debounce: Subscription,
        results: BricksSearchData[],
        nothingMatches: boolean,
        currentRequest: Subscription
    }
    codeFullyPrepared: boolean,
    preparedCode: string,
    preparedJson: string,
    prepareJsonAsPythonEnum: boolean,
    prepareJsonRemoveYOUR: boolean,
    extendedIntegrator: boolean,
    groupFilterOptions: GroupFilterOptions,
    extendedIntegratorGroupFilterOpen: boolean,
    querySourceSelectionOpen: boolean,
    querySourceSelectionRemote: boolean,
    querySourceSelectionLocalStrapiPort: number,
    querySourceSelectionLocalStrapiToken: string,
    querySourceSelectionLocalBricksPort: number,
    extendedIntegratorOverviewAddInfoOpen: boolean,
    extendedIntegratorNewParse: boolean,
}

export type BricksAPIData = {
    data: {
        attributes: {
            name: string,
            description: string,
            updatedAt: string,
            sourceCode: string,
            issueId: number,
            inputExample: string,
            endpoint: string,
            moduleType: string,
            [key: string]: unknown
            //v2 additions and also the check what parser should be used
            integratorInputs?: IntegratorInput,
            availableFor?: string[],
            partOfGroup?: string[],
            sourceCodeRefinery?: string
        }
        id: number
    }
    meta: {}
}

export type IntegratorInput = {
    name: string
    refineryDataType: RefineryDataType,
    globalComment?: string,
    outputs?: string[],
    variables: {
        [variableName: string]: IntegratorInputVariable
    }
}

export type BricksSearchData = {
    attributes: {
        name: string,
        description: string,
        updatedAt: string,
        moduleType: string,
        link?: string,
        [key: string]: unknown,
        //V2 values
        availableFor?: string[],
        partOfGroup?: string[],
    }
    id: number
    searchVisible?: boolean
    groupVisible?: boolean
}

export type GroupFilterOptions = {
    filterValues: {
        [key: string]: GroupFilterOption
    }
    filterValuesArray: GroupFilterOption[]
}

export type IntegratorInputVariable = {
    selectionType: SelectionType,
    allowedValues?: string[],
    allowedValueRange?: number[],
    defaultValue?: string,
    description?: string,
    optional?: StringBoolean,
    addInfo?: BricksVariableType[],
    acceptsMultiple?: StringBoolean,
}

export type GroupFilterOption = {
    key: string,
    name: string,
    active: boolean,
    countInGroup: number,
}

export type BricksIntegratorProps = {
    moduleTypeFilter?: string,
    executionTypeFilter?: string,
    forIde?: string | boolean,
    labelingTaskId?: string,
    nameLookups?: string[],
    functionType?: string,
    preparedCode?: (val: string | any) => void,
    newTaskId?: (taskId: string) => void
}

export type BricksVariable = {
    line: string,
    replacedLine: string,
    baseName: string,
    displayName: string,
    values: string[],
    allowedValues: any,
    pythonType: string,
    canMultipleValues: boolean,
    comment: string,
    optional: boolean,
    type: BricksVariableType
    options: {
        colors?: string[],
    }
}

export type BricksExpectedLabels = {
    expectedTaskLabels: ExpectedLabel[];
    labelsToBeCreated: number;
    labelWarning: boolean;
    canCreateTask: boolean;
    labelMappingActive: boolean;
    availableLabels: any[];
}

export type ExpectedLabel = {
    label: string,
    exists: boolean,
    backgroundColor: string,
    borderColor: string,
    textColor: string,
    mappedLabel?: string,
}

export type BricksIntegratorModalProps = {
    executionTypeFilter?: string,
    functionType: string,
    nameLookups?: string[],
    forIde?: string | boolean,
    labelingTaskId?: string,
    requestSearch: () => void,
    switchToPage: (page: IntegratorPage) => void,
    requestSearchDebounce: (value: string) => void,
    setGroupActive: (key: string) => void,
    selectSearchResult: (id: number) => void,
    setCodeTester: (code: string) => void,
    optionClicked: (option: string) => void,
    requestExample: () => void,
    checkCanAccept: (configCopy) => void,
    selectDifferentTask: (taskId: string) => void,
    newTaskId?: (taskId: string) => void
};

export type PageSearchProps = {
    requestSearchDebounce: (value: string) => void,
    setGroupActive: (key: string) => void,
    selectSearchResult: (id: number) => void,
}

export type PageOverviewProps = {
    setCodeTester: (code: string) => void,
};

export type PageInputExampleProps = {
    requestExample: () => void
};

export type PageIntegrationProps = {
    functionType: string,
    executionTypeFilter: string,
    nameLookups: string[],
    forIde?: string | boolean,
    labelingTaskId?: string,
    checkCanAccept: (configCopy) => void,
    selectDifferentTask: (taskId: string) => void,
}

export type VariableSelectProps = {
    variable: BricksVariable,
    index: number,
    labelingTaskId?: string,
    sendOption: () => void,
}