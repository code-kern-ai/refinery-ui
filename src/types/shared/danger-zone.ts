export type DangerZoneProps = {
    elementType: string;
    name: string;
    id: string;
};

// used with small letters because the same name is used in the display
export enum DangerZoneEnum {
    ATTRIBUTE = "attribute",
    LOOKUP_LIST = "lookup list",
    ACTIVE_LEARNING = "active learning",
    LABELING_FUNCTION = "labeling function",
    ZERO_SHOT = "zero shot",
    CROWD_LABELER = "crowd heuristic",
}