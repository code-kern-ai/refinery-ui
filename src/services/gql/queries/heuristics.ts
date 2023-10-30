import { gql } from "@apollo/client";

export const GET_HEURISTICS_OVERVIEW_DATA = gql`
query($projectId:ID!){
  informationSourcesOverviewData(projectId:$projectId)
}
`;

export const GET_CURRENT_WEAK_SUPERVISION_RUN = gql`
query ($projectId: ID!) {
  currentWeakSupervisionRun(projectId: $projectId) {
    id
    state
    createdAt
    user {
      id
      firstName
      lastName
      mail
    }
    finishedAt
    selectedInformationSources
    selectedLabelingTasks
    distinctRecords
    resultCount
  }
}
`;