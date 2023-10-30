export type ModalButton = {
    useButton?: boolean;
    type?: ModalButtonType; //shouldn't be set by use
    buttonCaption?: string;
    disabled?: boolean;
    closeAfterClick?: boolean;
    emitFunction?: (type: ModalButtonType) => void;
};
export enum ModalButtonType {
    CLOSE = "CLOSE",
    ACCEPT = "ACCEPT",
    ABORT = "ABORT",
    BACK = "BACK",
    EDIT = "EDIT"
}

export enum ModalEnum {
    ADMIN_DELETE_PROJECT = "ADMIN_DELETE_PROJECT",
    DELETE_LOOKUP_LIST = "DELETE_LOOKUP_LIST",
    MODAL_UPLOAD = "MODAL_UPLOAD",
    SAMPLE_PROJECT_TITLE = "SAMPLE_PROJECT_TITLE",
    VERSION_OVERVIEW = "VERSION_OVERVIEW",
    HOW_TO_UPDATE = "HOW_TO_UPDATE",
    CREATE_NEW_ATTRIBUTE = "CREATE_NEW_ATTRIBUTE",
    PROJECT_SNAPSHOT = "PROJECT_SNAPSHOT",
    GATES_INTEGRATION_WARNING = "GATES_INTEGRATION_WARNING",
    FILTERED_ATTRIBUTES = "FILTERED_ATTRIBUTES",
    ADD_EMBEDDING = "ADD_EMBEDDING",
    DELETE_EMBEDDING = "DELETE_EMBEDDING",
    DELETE_MODEL_DOWNLOAD = "DELETE_MODEL_DOWNLOAD",
    ADD_MODEL_DOWNLOAD = "ADD_MODEL_DOWNLOAD",
    DELETE_LABELING_TASK = "DELETE_LABELING_TASK",
    ADD_LABELING_TASK = "ADD_LABELING_TASK",
    ADD_LABEL = "ADD_LABEL",
    DELETE_LABEL = "DELETE_LABEL",
    CHANGE_COLOR = "CHANGE_COLOR",
    RENAME_LABEL = "RENAME_LABEL",
    EXECUTE_ATTRIBUTE_CALCULATION = "EXECUTE_ATTRIBUTE_CALCULATION",
    DELETE_ELEMENT = "DELETE_ELEMENT", // can be attribute, heuristic, lookup-list, data slice,
    VIEW_RECORD_DETAILS = "VIEW_RECORD_DETAILS",
    PASTE_LOOKUP_LIST = "PASTE_LOOKUP_LIST",
    REMOVE_LOOKUP_LIST = "REMOVE_LOOKUP_LIST",
    DELETE_MODEL_CALLBACKS = "DELETE_MODEL_CALLBACKS",
    DELETE_HEURISTICS = "DELETE_HEURISTICS",
    ADD_LABELING_FUNCTION = "ADD_LABELING_FUNCTION",
    ADD_ACTIVE_LEARNER = "ADD_ACTIVE_LEARNER",
    ADD_ZERO_SHOT = "ADD_ZERO_SHOT",
    ADD_CROWD_LABELER = "ADD_CROWD_LABELER",
}