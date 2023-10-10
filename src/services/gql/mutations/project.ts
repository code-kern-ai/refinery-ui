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

export const UPDATE_LABELING_TASK = gql`
mutation ($projectId: ID!, $labelingTaskId: ID!, $labelingTaskName: String!, $labelingTaskType: String!, $labelingTaskTargetId: ID) {
  updateLabelingTask(projectId: $projectId, labelingTaskId: $labelingTaskId, labelingTaskName: $labelingTaskName, labelingTaskType: $labelingTaskType, labelingTaskTargetId: $labelingTaskTargetId) {
    ok
  }
}
`;

export const DELETE_LABELING_TASK = gql`
mutation ($projectId: ID!, $labelingTaskId: ID!) {
  deleteLabelingTask(projectId: $projectId, labelingTaskId: $labelingTaskId) {
    ok
  }
}
`;

export const CREATE_LABELING_TASK = gql`
mutation ($projectId: ID!, $labelingTaskName: String!,$labelingTaskType:String!, $labelingTaskTargetId: ID) {
  createLabelingTask(projectId: $projectId, labelingTaskName: $labelingTaskName,labelingTaskType:$labelingTaskType, labelingTaskTargetId: $labelingTaskTargetId) {
    ok
  }
}
`;

export const DELETE_LABEL = gql`
mutation ($projectId: ID!, $labelId: ID!) {
  deleteLabel(projectId: $projectId, labelId: $labelId) {
    ok
  }
}
`;

export const CREATE_LABEL = gql`
mutation ($projectId: ID!, $labelingTaskId: ID!, $labelName: String!, $labelColor: String!) {
  createLabel(projectId: $projectId, labelingTaskId: $labelingTaskId, labelName: $labelName, labelColor: $labelColor) {
    label {
      id
      name
    }
  }
}
`;

export const UPDATE_LABEL_COLOR = gql`
mutation ($projectId: ID!, $labelingTaskLabelId: ID!, $labelColor: String!) {
  updateLabelColor(projectId: $projectId, labelingTaskLabelId: $labelingTaskLabelId, labelColor: $labelColor) {
    ok
  }
}
`;

export const UPDATE_LABEL_HOTKEY = gql`
mutation ($projectId: ID!, $labelingTaskLabelId: ID!, $labelHotkey: String!) {
  updateLabelHotkey(projectId: $projectId, labelingTaskLabelId: $labelingTaskLabelId, labelHotkey: $labelHotkey) {
    ok
  }
}
`;

export const HANDLE_LABEL_RENAME_WARNING = gql`
mutation ($projectId: ID!, $warningData: JSONString!) {
  handleLabelRenameWarnings(projectId: $projectId, warningData: $warningData) {
    ok
  }
} `;

export const UPDATE_LABEL_NAME = gql`
mutation ($projectId: ID!, $labelId: ID!, $newName: String!) {
  updateLabelName(projectId: $projectId, labelingTaskLabelId: $labelId, newName: $newName) {
    ok
  }
}  `;