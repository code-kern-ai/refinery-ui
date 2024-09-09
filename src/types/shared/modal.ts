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
    LAST_WEAK_SUPERVISION_RUN = "LAST_WEAK_SUPERVISION_RUN",
    SAMPLE_RECORDS_LABELING_FUNCTION = "SAMPLE_RECORDS_LABELING_FUNCTION",
    WHY_SO_LONG = "WHY_SO_LONG",
    SAMPLE_RECORDS_ZERO_SHOT = "SAMPLE_RECORDS_ZERO_SHOT",
    CANCEL_EXECUTION = "CANCEL_EXECUTION",
    DATA_SLICE_INFO = "DATA_SLICE_INFO",
    DELETE_SLICE = "DELETE_SLICE",
    USER_INFO = "USER_INFO",
    SAVE_DATA_SLICE = "SAVE_DATA_SLICE",
    CONFIGURATION = "CONFIGURATION",
    RECORD_COMMENTS = "RECORD_COMMENTS",
    SIMILARITY_SEARCH = "SIMILARITY_SEARCH",
    CREATE_OUTLIER_SLICE = "CREATE_OUTLIER_SLICE",
    DELETE_RECORD = "DELETE_RECORD",
    LABELING_SETTINGS = "LABELING_SETTINGS",
    LABELING_INFO_TABLE = "LABELING_INFO_TABLE",
    INFO_LABEL_BOX = "INFO_LABEL_BOX",
    SYNC_RECORDS = "SYNC_RECORDS",
    EXPLAIN_EDIT_RECORDS = "EXPLAIN_EDIT_RECORDS",
    NEW_PERSONAL_TOKEN = "NEW_PERSONAL_TOKEN",
    DELETE_PERSONAL_TOKEN = "DELETE_PERSONAL_TOKEN",
    NOTIFICATION_CENTER = "NOTIFICATION_CENTER",
    EXPORT_RECORDS = "EXPORT_RECORDS",
    BRICKS_INTEGRATOR = "BRICKS_INTEGRATOR",
    SIZE_WARNING = "SIZE_WARNING",
}