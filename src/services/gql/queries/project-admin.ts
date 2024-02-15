import { gql } from '@apollo/client'

export const GET_ALL_PERSONAL_ACCESS_TOKENS = gql`
  query ($projectId: ID!) {
    allPersonalAccessTokens(projectId: $projectId) {
      id
      projectId
      name
      scope
      createdBy
      createdAt
      expiresAt
      lastUsed
    }
  }
`
