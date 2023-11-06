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

export const GET_LABELING_FUNCTION_ON_10_RECORDS = gql`
query ($projectId: ID!, $informationSourceId: ID!) {
  getLabelingFunctionOn10Records(projectId: $projectId, informationSourceId: $informationSourceId) {
    records {	
      recordId
      calculatedLabels
      fullRecordData
    }
    containerLogs
    codeHasErrors
  }
}
`;

export const GET_ZERO_SHOT_TEXT = gql`
query ($projectId: ID!, $informationSourceId: ID!, $config: String!, $text: String!, $runIndividually:Boolean!, $labels: JSONString!) {
  zeroShotText(projectId: $projectId, informationSourceId: $informationSourceId, config: $config, text: $text, runIndividually: $runIndividually, labelNames: $labels) {
    config
    text
    labels {
      labelName
      confidence
    }
  }
}  
`;

export const GET_ZERO_SHOT_10_RANDOM_RECORDS = gql`
query ($projectId: ID!, $informationSourceId: ID!, $labels: JSONString) {
  zeroShot10Records(projectId: $projectId, informationSourceId: $informationSourceId, labelNames: $labels) {
    duration
    records {
      recordId
      checkedText
      fullRecordData
      labels {
        labelName
        confidence
      }
    }
  }
}
`;

export const GET_ACCESS_LINK = gql`
query ($projectId: ID!, $linkId: ID!) {
  accessLink(projectId: $projectId, linkId: $linkId) {
    id
    link
    isLocked
  }
}
`;