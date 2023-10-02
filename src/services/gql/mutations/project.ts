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