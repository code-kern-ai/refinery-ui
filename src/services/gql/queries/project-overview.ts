import { gql } from "@apollo/client";

export const GET_GENERAL_PROJECT_STATS = gql`
query($projectId:ID!,$labelingTaskId:ID,$sliceId:ID){
  generalProjectStats(projectId:$projectId,labelingTaskId:$labelingTaskId,sliceId:$sliceId)
}
`;

export const GET_LABEL_DISTRIBUTION = gql`
query($projectId:ID!,$labelingTaskId:ID,$sliceId:ID){
  labelDistribution(projectId:$projectId,labelingTaskId:$labelingTaskId,sliceId:$sliceId)
}
`;

export const GET_CONFIDENCE_DISTRIBUTION = gql`
query ($projectId: ID!, $labelingTaskId: ID, $sliceId: ID) {
  confidenceDistribution(projectId: $projectId, labelingTaskId: $labelingTaskId, sliceId: $sliceId)
}  
`;

export const GET_CONFUSION_MATRIX = gql`
query($projectId:ID!,$labelingTaskId:ID!,$sliceId:ID){
  confusionMatrix(projectId:$projectId,labelingTaskId:$labelingTaskId,sliceId:$sliceId)
}

`;

export const IS_RATS_TOKENIZAION_STILL_RUNNING = gql`
query ($projectId: ID!) {
  isRatsTokenizationStillRunning(projectId: $projectId)
}
`;