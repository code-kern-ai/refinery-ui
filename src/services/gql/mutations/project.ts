import { gql } from "@apollo/client";

export const CREATE_USER_ATTRIBUTE = gql`
mutation($projectId: ID!, $name: String!, $dataType: String!){
  createUserAttribute(projectId: $projectId, name: $name, dataType: $dataType) {
    ok
    attributeId
  } 
}
`;

export const UPDATE_ATTRIBUTE = gql`
mutation($projectId: ID!, $attributeId: ID!, $dataType: String, $isPrimaryKey: Boolean, $name: String, $sourceCode: String, $visibility: String) {
  updateAttribute(
    projectId: $projectId, 
    attributeId: $attributeId, 
    dataType: $dataType,
    isPrimaryKey:$isPrimaryKey,
    name: $name,
    sourceCode: $sourceCode,
    visibility: $visibility
  ) {
    ok
  }
}
`;

export const UPDATE_PROJECT_NAME_AND_DESCRIPTION = gql`
mutation ($projectId: ID!, $name: String, $description: String) {
  updateProjectNameAndDescription(projectId: $projectId, name: $name, description: $description) {
    ok
  }
}  
`;

export const UPDATE_PROJECT_FOR_GATES = gql`
mutation($projectId: ID!) {
  updateProjectForGates(projectId: $projectId){
    ok
  } 
}
`;

export const DELETE_FROM_TASK_QUEUE = gql`
mutation ($projectId: ID!, $taskId: ID!) {
  deleteFromTaskQueue(projectId: $projectId, taskId: $taskId) {
    ok
  }
}
`;

export const DELETE_EMBEDDING = gql`
mutation ($projectId: ID!, $embeddingId: ID!) {
  deleteEmbedding(projectId: $projectId, embeddingId: $embeddingId) {
    ok
  }
}
`;

export const CREATE_EMBEDDING = gql`
mutation($projectId: ID!, $attributeId: ID!, $config: JSONString!) {
  createEmbedding(projectId: $projectId, attributeId: $attributeId, config: $config) {
    ok
  }
}  
`;

export const UPDATE_EMBEDDING_PAYLOAD = gql`
mutation($projectId: ID!, $embeddingId: ID!, $filterAttributes: JSONString!) {
  updateEmbeddingPayload(projectId: $projectId, embeddingId: $embeddingId, filterAttributes: $filterAttributes) {
    ok
  }
}
`;