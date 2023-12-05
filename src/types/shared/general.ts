import { UserType } from "../components/projects/projectId/labeling/labeling-main-component";

export enum CurrentPage {
    PROJECTS = 'PROJECTS',
    LOOKUP_LISTS_OVERVIEW = 'LOOKUP_LISTS_OVERVIEW',
    NEW_PROJECT = 'NEW_PROJECT',
    PROJECT_OVERVIEW = 'PROJECT_OVERVIEW',
    DATA_BROWSER = 'DATA_BROWSER',
    LABELING = 'LABELING',
    HEURISTICS = 'HEURISTICS',
    ADMIN_PAGE = 'ADMIN_PAGE',
    USERS = 'USERS',
    UPLOAD_RECORDS = 'UPLOAD_RECORDS',
    PROJECT_SETTINGS = "PROJECT_SETTINGS",
    MODELS_DOWNLOAD = "MODELS_DOWNLOAD",
    ATTRIBUTE_CALCULATION = "ATTRIBUTE_CALCULATION",
    LOOKUP_LISTS_DETAILS = "LOOKUP_LISTS_DETAILS",
    MODEL_CALLBACKS = "MODEL_CALLBACKS",
    LABELING_FUNCTION = "LABELING_FUNCTION",
    ACTIVE_LEARNING = "ACTIVE_LEARNING",
    ZERO_SHOT = "ZERO_SHOT",
    CROWD_LABELER = "CROWD_LABELER",
    RECORD_IDE = "RECORD_IDE",
}

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    mail: string;
    role: string;
    avatarUri: string;
    counts?: any[];
    countSum?: number;
    user?: User;
    userType?: UserType;
}

export enum DataTypeEnum {
    INTEGER = "INTEGER",
    CATEGORY = "CATEGORY",
    TEXT = "TEXT",
    FLOAT = "FLOAT",
    BOOLEAN = "BOOLEAN",
    EMBEDDING_LIST = "EMBEDDING_LIST",
}