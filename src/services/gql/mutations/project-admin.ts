import { gql } from '@apollo/client'

export const CREATE_PERSONAL_ACCESS_TOKEN = gql`
  mutation (
    $projectId: ID!
    $name: String!
    $expiresAt: String!
    $scope: String!
  ) {
    createPersonalAccessToken(
      projectId: $projectId
      name: $name
      expiresAt: $expiresAt
      scope: $scope
    ) {
      token
    }
  }
`

export const DELETE_PERSONAL_ACCESS_TOKEN = gql`
  mutation ($projectId: ID!, $tokenId: ID!) {
    deletePersonalAccessToken(projectId: $projectId, tokenId: $tokenId) {
      ok
    }
  }
`
