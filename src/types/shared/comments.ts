export enum CommentPosition {
    RIGHT = "RIGHT",
    LEFT = "LEFT"
}

export type CommentMainSectionProps = {
    toggleOpen: () => void;
    open: boolean;
}

export type CommentData = {
    comment: string;
    created_at: string;
    created_by: string;
    id: string;
    is_markdown: boolean;
    is_private: boolean;
    order_key: number;
    projectId: string;
    xfkey: string;
    xftype: CommentType;
    open: boolean;
    edit: boolean;
    avatarUri: string;
    creationUser: string;
    xfkeyAddName: string;
    xfkeyAdd: string;
};

export enum CommentType {
    LABELING_TASK = "LABELING_TASK",
    RECORD = "RECORD",
    ORGANIZATION = "ORGANIZATION",
    ATTRIBUTE = "ATTRIBUTE",
    USER = "USER",
    EMBEDDING = "EMBEDDING",
    HEURISTIC = "HEURISTIC",
    DATA_SLICE = "DATA_SLICE",
    KNOWLEDGE_BASE = "KNOWLEDGE_BASE",
    LABEL = "LABEL"
}

export type CommentRequest = {
    commentType: CommentType;
    projectId?: string;
    commentKey?: string;
    commentId?: string;
};

export type CommentDataStore = {
    key: string,
    commentType: CommentType,
    commentKeyName: string,
    commentOrderKey: number
};

export type DisplayCommentsProps = {
    position: CommentPosition;
    openComments: boolean[];
    editComments: boolean[];
    commentTexts: string[]
    handleCommentClick: (index: number) => void;
    handleEditClick: (index: number) => void;
    editComment: (event: Event, commentId: string, toChangeKey: string, toChangeValue: any, index: number) => void;
    handleCommentTextChange: (value: string, index: number) => void;
    deleteComment: (id: string) => void;
}

export type CommentCreationProps = {
    saveComment(type: string, commentId: string, comment: string, isPrivate: boolean): void;
    closeCommentCreation(): void;
    isOpen: boolean;
};