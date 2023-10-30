import { gql } from "@apollo/client";

export const TOGGLE_HEURISTICS_SELECTED = gql`
mutation ($projectId: ID!, $informationSourceId: ID!) {
  toggleInformationSource(projectId: $projectId, informationSourceId: $informationSourceId) {
    ok
  }
}
`;

export const SET_ALL_HEURISTICS = gql`
mutation ($projectId: ID!, $value: Boolean!) {
  setAllInformationSourceSelected(projectId: $projectId, value: $value) {
    ok
  }
}

`;

export const DELETE_HEURISTIC = gql`
mutation ($projectId: ID!, $informationSourceId: ID!) {
  deleteInformationSource(
    projectId: $projectId
    informationSourceId: $informationSourceId
  ) {
    ok
  }
}
`;

export const CREATE_HEURISTIC = gql`
mutation ($projectId: ID!, $labelingTaskId: ID!, $description: String!, $sourceCode: String!, $name: String!, $type: String!) {
  createInformationSource(projectId: $projectId, labelingTaskId: $labelingTaskId, type: $type, description: $description, sourceCode: $sourceCode, name: $name) {
    informationSource {
      id
      name
      createdAt
      sourceCode
      description
      isSelected
      projectId
    }
  }
}
`;

export const CREATE_ZERO_SHOT_INFORMATION_SOURCE = gql`
mutation ($projectId: ID!, $targetConfig: String!, $labelingTaskId: ID!, $attributeId: ID) {
  createZeroShotInformationSource(projectId: $projectId, targetConfig: $targetConfig, labelingTaskId: $labelingTaskId, attributeId: $attributeId) {
    id
  }
}  
`;