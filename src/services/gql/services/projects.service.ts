import { useLazyQuery, useQuery } from "@apollo/client"
import { GET_PROJECT_BY_ID } from "../queries/projects"

export function getProjectByProjectId(projectId: string) {
    return useQuery(GET_PROJECT_BY_ID, {
        variables: {
            projectId
        }
    });
}