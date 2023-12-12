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

export const DELETE_USER_ATTRIBUTE = gql`
mutation($projectId:ID!,$attributeId:ID!){
  deleteUserAttribute(projectId:$projectId,attributeId:$attributeId){
    ok
  }
}
`;

export const CREATE_COMMENT = gql`
mutation ($comment: String!, $xftype: String!, $xfkey: ID!, $projectId: ID, $isPrivate: Boolean) {
  createComment(comment: $comment, xftype: $xftype, xfkey: $xfkey, projectId: $projectId, isPrivate: $isPrivate) {
    ok
  }
}

`;

export const DELETE_COMMENT = gql`
mutation ($commentId: ID!, $projectId: ID) {
  deleteComment(commentId: $commentId, projectId: $projectId) {
    ok
  }
}
`;

export const UPDATE_COMMENT = gql`
mutation ($commentId: ID!, $changes: JSONString!, $projectId: ID) {
  updateComment(commentId: $commentId, changes: $changes, projectId: $projectId) {
    ok
  }
}
`;