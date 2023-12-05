import { gql } from "@apollo/client";

export const RUN_RECORD_IDE = gql`
query ($projectId: ID!, $recordId: ID!, $code: String!) {
  runRecordIde(projectId:$projectId, recordId:$recordId, code:$code)
}
`;