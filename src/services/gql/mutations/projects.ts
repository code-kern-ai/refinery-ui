import { gql } from "@apollo/client";

export const DELETE_PROJECT = gql`
mutation ($projectId: ID!) {
  deleteProject(projectId: $projectId) {
    ok
  }
}
`;

export const CREATE_PROJECT = gql`
mutation ($name: String, $description: String!) {
  createProject(name: $name, description: $description) {
    project {
      id
    }
  }
}
`;