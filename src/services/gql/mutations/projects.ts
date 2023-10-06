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

export const CREATE_SAMPLE_PROJECT = gql`
mutation($name:String, $projectType: String){
  createSampleProject(name: $name, projectType: $projectType){
    ok
    project{
      id
      name
      description
    }
  }
}  
`;

export const MODEL_PROVIDER_DELETE_MODEL = gql`
mutation($modelName: String!) {
  modelProviderDeleteModel(modelName: $modelName) {
    ok
  }
}
`;

export const MODEL_PROVIDER_DOWNLOAD_MODEL = gql`
mutation($modelName: String!) {
modelProviderDownloadModel(modelName: $modelName) {
  ok
}
}
`;