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