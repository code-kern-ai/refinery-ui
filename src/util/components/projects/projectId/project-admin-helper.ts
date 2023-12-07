import { PersonalAccessToken } from "@/src/types/components/projects/projectId/project-admin"

export const EXPIRATION_TIME = ['ONE_MONTH', 'THREE_MONTHS', 'NEVER'];

export function postProcessPersonalAccessToken(data: any): PersonalAccessToken[] {
    return []
}