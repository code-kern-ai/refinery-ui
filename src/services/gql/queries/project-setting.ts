import { gql } from "@apollo/client";

export const GET_LABELING_TASKS_BY_PROJECT_ID = gql`
query ($projectId: ID!) {
  projectByProjectId(projectId: $projectId) {
    id
    labelingTasks {
      edges {
        node {
          id
          name
          taskTarget
          taskType
          attribute {
            id
            name
            relativePosition
            dataType
          }
          labels {
            edges {
              node {
                id
                name
                color
                hotkey
              }
            }
          }
          informationSources {
            edges {
              node {
                id
                type
                returnType
                name
                description
              }
            }
          }
        }
      }
    }
  }
}  
`;

export const GET_ATTRIBUTES_BY_PROJECT_ID = gql`
query($projectId: ID!, $stateFilter: [String!]) {
  attributesByProjectId(projectId: $projectId, stateFilter: $stateFilter) {
    id
    name
    dataType
    isPrimaryKey
    relativePosition    
    userCreated
    sourceCode
    state
    logs
    visibility
  }
}  
`;

export const CHECK_COMPOSITE_KEY = gql`
query($projectId:ID!){
  checkCompositeKey(projectId:$projectId)
}`;

export const GET_PROJECT_SIZE = gql`
query ($projectId: ID!) {
  projectSize(projectId: $projectId) {
    table
    description
    default
    byteSize
    byteReadable
  }
}  
`;

export const LAST_PROJECT_EXPORT_CREDENTIALS = gql`
query ($projectId: ID!) {
  lastProjectExportCredentials(projectId:$projectId)
}`;

export const PREPARE_PROJECT_EXPORT = gql`
query ($projectId: ID!, $exportOptions: JSONString, $key: String) {
  prepareProjectExport(projectId: $projectId, exportOptions: $exportOptions, key: $key)
}`;

export const GET_PROJECT_TOKENIZATION = gql`
query ($projectId: ID!) {
  projectTokenization(projectId: $projectId) {
    id
    projectId
    userId
    type
    state
    progress
    workload
    startedAt
    finishedAt
  }
}  
`;

export const GET_GATES_INTEGRATION_DATA = gql`
query ($projectId: ID!) {
  getGatesIntegrationData(projectId: $projectId) {
    status
    missingTokenizer
    missingEmbeddings
    missingInformationSources
  }
}`;

export const GET_EMBEDDING_SCHEMA_BY_PROJECT_ID = gql`
query ($projectId: ID!) {
  projectByProjectId(projectId: $projectId) {
    id
    embeddings {
      edges {
        node {
          id
          name
          custom
          type
          state
          progress
          dimension
          count
          platform
          model
          filterAttributes
          attributeId
        }
      }
    }
  }
}
`;

export const GET_QUEUED_TASKS = gql`
query ($projectId: ID!,$taskType: String!) {
  queuedTasks(projectId: $projectId, taskType: $taskType) {
    id
    projectId
    taskType
    taskInfo
  }
}
`;

export const GET_EMBEDDING_PLATFORMS = gql`
query {
  embeddingPlatforms {
    platform
    terms
    link
  }
}`;

export const GET_RECOMMENDED_ENCODERS_FOR_EMBEDDINGS = gql`
query ($projectId: ID) {
  recommendedEncoders(projectId: $projectId) {
    configString
    description
    tokenizers
    applicability
    platform
  }
} 
`;

export const GET_ZERO_SHOT_RECOMMENDATIONS = gql`
query ($projectId: ID) {
  zeroShotRecommendations(projectId: $projectId)
}
`;

export const CHECK_RENAME_LABEL = gql`
query ($projectId: ID!, $labelId: ID!, $newName: String!) {
  checkRenameLabel(projectId: $projectId, labelId: $labelId, newName: $newName)
}
`;

export const CALCULATE_USER_ATTRIBUTE_SAMPLE_RECORDS = gql`
query($projectId: ID!, $attributeId: ID!){
  calculateUserAttributeSampleRecords(projectId: $projectId, attributeId: $attributeId) {
    recordIds
    calculatedAttributes 
  }
}
`;

export const GET_RECORD_BY_RECORD_ID = gql`
query ($projectId: ID!, $recordId: ID!) {
  recordByRecordId(projectId: $projectId, recordId: $recordId) {
    id
    data
    projectId
    category      
  }
} 
`;

export const GET_ATTRIBUTE_BY_ATTRIBUTE_ID = gql`
query($projectId: ID!, $attributeId: ID!){
  attributeByAttributeId(projectId: $projectId, attributeId: $attributeId) {
    id
    name
    dataType
    isPrimaryKey
    relativePosition    
    userCreated
    sourceCode
    state
    logs
    visibility
    progress
  }
}
`;

export const LAST_RECORD_EXPORT_CREDENTIALS = gql`
query ($projectId: ID!) {
  lastRecordExportCredentials(projectId:$projectId)
}`;

export const GET_RECORD_EXPORT_FORM_DATA = gql`
query ($projectId: ID!) {
  projectByProjectId(projectId: $projectId) {
    id
    name
    labelingTasks {
      edges {
        node {
          id
          name
          attribute {
            relativePosition
          }
        }
      }
    }
    informationSources {
      edges {
        node {
          id
          name
        }
      }
    }
    attributes {
      edges {
        node {
          id
          name
          state
        }
      }
    }
    dataSlices {
      edges {
        node {
          id
          name
          sliceType
          createdAt
        }
      }
    }
  }
}  

`;

export const PREPARE_RECORD_EXPORT = gql`
query ($projectId: ID!, $exportOptions: JSONString, $key: String) {
  prepareRecordExport(projectId: $projectId, exportOptions: $exportOptions, key: $key)
}
`;