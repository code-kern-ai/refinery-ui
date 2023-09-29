export enum CurrentPage {
    PROJECTS = 'PROJECTS',
    LOOKUP_LISTS_OVERVIEW = 'LOOKUP_LISTS_OVERVIEW',
    NEW_PROJECT = 'NEW_PROJECT',
    PROJECT_OVERVIEW = 'PROJECT_OVERVIEW',
    DATA_BROWSER = 'DATA_BROWSER',
    LABELING = 'LABELING',
    HEURISTICS = 'HEURISTICS',
    SETTINGS = 'SETTINGS',
    ADMIN_PAGE = 'ADMIN_PAGE',
    USERS = 'USERS',
    UPLOAD_RECORDS = 'UPLOAD_RECORDS',
    PROJECT_SETTINGS = "PROJECT_SETTINGS"
}

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    mail: string;
    role: string;
    avatarUri: string;
}

export enum DataTypeEnum {
    INTEGER = "INTEGER",
    CATEGORY = "CATEGORY",
    TEXT = "TEXT",
    FLOAT = "FLOAT",
    BOOLEAN = "BOOLEAN",
    EMBEDDING_LIST = "EMBEDDING_LIST",
}