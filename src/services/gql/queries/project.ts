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

export const GET_GENERAL_PROJECT_STATS = gql`
query($projectId:ID!,$labelingTaskId:ID,$sliceId:ID){
  generalProjectStats(projectId:$projectId,labelingTaskId:$labelingTaskId,sliceId:$sliceId)
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