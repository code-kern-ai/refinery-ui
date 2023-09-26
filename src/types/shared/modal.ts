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
}