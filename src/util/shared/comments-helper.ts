import { CommentRequest, CommentType } from "@/src/types/shared/comments";
import { User } from "@/src/types/shared/general";

export function commentRequestToKey(cr: CommentRequest) {
    return cr.commentType + "@" + cr.projectId + "@" + cr.commentKey;
}

export function parseKey(key: string): CommentRequest {
    const parts = key.split("@");
    const toReturn = { commentType: parts[0] as CommentType, projectId: parts[1], commentKey: parts[2] };
    if (toReturn.projectId == 'undefined') delete toReturn.projectId;
    if (toReturn.commentKey == 'undefined') delete toReturn.commentKey;

    return toReturn;
}


export function getUserNameFromId(userId: string, allUsers: User[]): string {
    const user = allUsers?.find(u => u.id == userId);
    if (!user || !user.mail) return "Unknown user ID";
    return user.mail;
}

export function commentTypeToString(type: CommentType, singular: boolean = false): string {
    switch (type) {
        case CommentType.LABELING_TASK:
        case CommentType.RECORD:
        case CommentType.ORGANIZATION:
        case CommentType.ATTRIBUTE:
        case CommentType.USER:
        case CommentType.EMBEDDING:
        case CommentType.HEURISTIC:
        case CommentType.DATA_SLICE:
        case CommentType.KNOWLEDGE_BASE:
        case CommentType.LABEL:
            let name = type.replace("_", " ").toLowerCase();
            name = name.charAt(0).toUpperCase() + name.slice(1);
            return name + (singular ? "" : "s");
    }
    return "Unknown type"
}

export function commentTypeOrder(type: CommentType): number {
    switch (type) {
        case CommentType.ORGANIZATION: return 10;
        case CommentType.USER: return 20;
        case CommentType.ATTRIBUTE: return 30;
        case CommentType.LABELING_TASK: return 40;
        case CommentType.LABEL: return 41;
        case CommentType.EMBEDDING: return 50;
        case CommentType.HEURISTIC: return 60;
        case CommentType.DATA_SLICE: return 70;
        case CommentType.KNOWLEDGE_BASE: return 70;
        case CommentType.RECORD: return 100;
    }
    console.log("unknown comment type", type);
    return -1
}

export function convertTypeToKey(type: string): string {
    switch (type) {
        case "Attributes": return CommentType.ATTRIBUTE;
        case "Labeling tasks": return CommentType.LABELING_TASK;
        case "Labels": return CommentType.LABEL;
        case "Data slices": return CommentType.DATA_SLICE;
    }
}