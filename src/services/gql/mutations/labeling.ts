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