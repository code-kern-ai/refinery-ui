import { gql } from "@apollo/client";

export const DELETE_PROJECT = gql`
mutation ($projectId: ID!) {
  deleteProject(projectId: $projectId) {
    ok
  }
}
`;