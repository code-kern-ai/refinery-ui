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

export const UPDATE_PROJECT_TOKENIZER = gql`
mutation($projectId:ID!,$tokenizer:String){
  updateProjectTokenizer(projectId:$projectId,tokenizer:$tokenizer){
    ok
  }
}`;

export const UPDATE_PROJECT_STATUS = gql`
mutation ($projectId: ID!, $newStatus: String) {
  updateProjectStatus(projectId: $projectId, newStatus: $newStatus) {
    ok
  }
}
`;

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