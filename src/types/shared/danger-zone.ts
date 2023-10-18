export type DangerZoneProps = {
    elementType: string;
    name: string;
    id: string;
};

// used with small letters because the same name is used in the display
export enum DangerZoneEnum {
    ATTRIBUTE = "attribute",
    LOOKUP_LIST = "lookup list",
}