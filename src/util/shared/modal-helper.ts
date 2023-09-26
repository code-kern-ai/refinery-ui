import { ModalButtonType } from "@/src/types/shared/modal";

export function modalButtonCaption(type: ModalButtonType): string {
    switch (type) {
        case ModalButtonType.CLOSE: return "Close";
        case ModalButtonType.ACCEPT: return "Accept";
        case ModalButtonType.ABORT: return "Abort";
        case ModalButtonType.BACK: return "Back";
        case ModalButtonType.EDIT: return "Edit";
        default: return "Unknown";
    }
}