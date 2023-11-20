import { gql } from "@apollo/client";

export const DELETE_RECORD_BY_RECORD_ID = gql`  
mutation($projectId: ID!, $recordId: ID!){
  deleteRecord(projectId:$projectId,recordId:$recordId){
    ok
  }
}
`;