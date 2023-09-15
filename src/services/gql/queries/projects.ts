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

export const GET_PROJECT_LIST = gql`
query {
    allProjects {
      edges {
        node {
          id
          name
          description
          status
          projectType
          numDataScaleUploaded
          createdAt
          user{
            firstName
            lastName
            mail
          }
        }
      }
    }
  }      
`;

export const GET_OVERVIEW_STATS = gql`
query{
  overviewStats
}`;

export const GET_ALL_TOKENIZER_OPTIONS = gql`
query{
  languageModels{
    name,
    configString
  }
}`;