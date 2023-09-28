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