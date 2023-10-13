import { gql } from "@apollo/client";

export const GET_GENERAL_PROJECT_STATS = gql`
query($projectId:ID!,$labelingTaskId:ID,$sliceId:ID){
  generalProjectStats(projectId:$projectId,labelingTaskId:$labelingTaskId,sliceId:$sliceId)
}
`;