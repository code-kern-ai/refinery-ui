import { gql } from "@apollo/client";

export const GET_PROJECT_BY_ID = gql`
query ($projectId: ID!) {
  projectByProjectId(projectId: $projectId) {
    id
    name
    description
    projectType
    tokenizer
    numDataScaleUploaded
  }
}
`;