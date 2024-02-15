import { gql } from '@apollo/client'

export const GET_MODEL_CALLBACKS_OVERVIEW_DATA = gql`
  query ($projectId: ID!) {
    modelCallbacksOverviewData(projectId: $projectId)
  }
`
