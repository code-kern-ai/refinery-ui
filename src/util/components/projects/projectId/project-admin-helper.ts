import { ExpirationTime, PersonalAccessToken } from "@/src/types/components/projects/projectId/project-admin"
import { dateAsUTCDate } from "@/submodules/javascript-functions/date-parser";

export const EXPIRATION_TIME = [
    { name: "One month", value: ExpirationTime.ONE_MONTH },
    { name: "Three months", value: ExpirationTime.THREE_MONTHS },
    { name: "Never", value: ExpirationTime.NEVER }
];
export const READ_WRITE_SCOPE = "READ_WRITE";

export function postProcessPersonalAccessToken(data: any): PersonalAccessToken[] {
    return data.map((token: any) => {
        return {
            createdAt: convertTokenDate(token.createdAt),
            createdBy: token.createdBy,
            expiresAt: convertTokenDate(token.expiresAt),
            id: token.id,
            lastUsed: convertTokenDate(token.lastUsed),
            name: token.name,
            projectId: token.projectId,
            scope: convertTokenScope(token.scope)
        };
    });
}

function convertTokenScope(scope: string): string {
    if (scope == "READ_WRITE") return "Read and write";
    else return "Invalid";
}

function convertTokenDate(date: string): string {
    if (date == null) return "Never";
    return dateAsUTCDate(new Date(date)).toLocaleDateString();
}