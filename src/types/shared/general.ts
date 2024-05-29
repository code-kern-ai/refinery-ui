import { UserType } from "../components/projects/projectId/labeling/labeling-main-component";

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