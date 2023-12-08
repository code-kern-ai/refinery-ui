export type PersonalAccessToken = {
    createdAt: string;
    createdBy: string;
    expiresAt: string;
    id: string;
    lastUsed: string;
    name: string;
    projectId: string;
    scope: string;
};

export type PersonalTokenModalProps = {
    refetchTokens: () => void;
}

export enum ExpirationTime {
    ONE_MONTH = "ONE_MONTH",
    THREE_MONTHS = "THREE_MONTHS",
    NEVER = "NEVER"
}