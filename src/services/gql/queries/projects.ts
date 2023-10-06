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

export const GET_UPLOAD_CREDENTIALS_AND_ID = gql`
query ($projectId: ID!, $fileName: String!, $fileType: String!,$fileImportOptions:String!,$uploadType:String, $key: String) {
  uploadCredentialsAndId(projectId: $projectId, fileName: $fileName, fileType: $fileType,fileImportOptions:$fileImportOptions,uploadType:$uploadType, key: $key)
}
`;

export const GET_UPLOAD_TASK_BY_TASK_ID = gql`
query ($projectId: ID!, $uploadTaskId: ID!) {
  uploadTaskById(projectId: $projectId, uploadTaskId: $uploadTaskId) {
    id
    userId
    state
    progress
    fileAdditionalInfo
  }
}
`;

export const GET_MODEL_PROVIDER_INFO = gql`
query{
  modelProviderInfo {
    name
    revision
    link
    date
    size
    status
    zeroShotPipeline
  }
}
`;