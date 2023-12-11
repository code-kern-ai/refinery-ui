export enum CommentPosition {
    RIGHT = "RIGHT",
    LEFT = "LEFT"
}

export type CommentMainSectionProps = {
    toggleOpen: () => void;
    open: boolean;
}