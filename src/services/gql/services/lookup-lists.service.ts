import { useLazyQuery } from "@apollo/client";
import { LOOKUP_LISTS_BY_PROJECT_ID } from "../queries/lookup-lists";

export function getLookupListsByProjectId(projectId: string) {
    return useLazyQuery(LOOKUP_LISTS_BY_PROJECT_ID, {
        fetchPolicy: "network-only",
        variables: {
            projectId: projectId
        },
    })
}