import { gql } from "@apollo/client";

export const DELETE_RECORD_BY_RECORD_ID = gql`  
mutation($projectId: ID!, $recordId: ID!){
  deleteRecord(projectId:$projectId,recordId:$recordId){
    ok
  }
}
`;

export const DELETE_RECORD_LABEL_ASSOCIATION_BY_ID = gql`
mutation($projectId: ID!, $recordId: ID!, $associationIds: [ID]){
  deleteRecordLabelAssociationByIds( 
    projectId:$projectId,
    recordId:$recordId,
    associationIds:$associationIds){
    ok
  }
}
`;

export const ADD_CLASSIFICATION_LABELS_TO_RECORD = gql`
mutation ($projectId: ID!, $recordId: ID!, $labelingTaskId: ID, $labelId: ID, $asGoldStar:Boolean, $sourceId: ID) {
  addClassificationLabelsToRecord(projectId: $projectId, recordId: $recordId, labelingTaskId: $labelingTaskId, labelId: $labelId,asGoldStar:$asGoldStar, sourceId: $sourceId) {
    ok
  }
}
`;

export const ADD_EXTRACTION_LABEL_TO_RECORD = gql`
mutation ($projectId: ID!, $recordId: ID!, $labelingTaskId: ID!, $tokenStartIndex: Int!, $tokenEndIndex: Int!, $value: String!, $labelId: ID!, $asGoldStar:Boolean, $sourceId: ID) {
  addExtractionLabelToRecord(projectId: $projectId, recordId: $recordId, labelingTaskId: $labelingTaskId, tokenStartIndex: $tokenStartIndex, tokenEndIndex: $tokenEndIndex, value: $value, labelId: $labelId,asGoldStar:$asGoldStar, sourceId: $sourceId) {
    ok
  }
}
`;