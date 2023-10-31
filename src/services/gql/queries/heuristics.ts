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

export const GET_HEURISTICS_BY_ID = gql`
query ($projectId: ID!, $informationSourceId: ID!) {
  informationSourceBySourceId(projectId: $projectId, informationSourceId: $informationSourceId) {
    id
    name
    type
    description
    sourceCode
    isSelected
    labelingTaskId
    returnType
    lastPayload {
      id
      createdAt
      finishedAt
      state
      iteration
      progress
      __typename
    }
    sourceStatistics {
      edges {
        node {
          labelingTaskLabel {
            name
            color
            __typename
          }
          truePositives
          falsePositives
          falseNegatives
          recordCoverage
          totalHits
          sourceConflicts
          sourceOverlaps
          active
        }
      }
    }
  }
}
`;

export const GET_TASK_BY_TASK_ID = gql`
query ($projectId: ID!, $payloadId: ID!) {
  payloadByPayloadId(projectId: $projectId, payloadId: $payloadId) {
    id
    createdAt
    state
    logs
    iteration
    informationSource {
      type
    }
  }
}
`;