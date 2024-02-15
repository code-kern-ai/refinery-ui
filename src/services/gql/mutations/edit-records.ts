import { gql } from '@apollo/client'

export const EDIT_RECORDS = gql`
  mutation ($projectId: ID!, $changes: JSONString!) {
    editRecords(projectId: $projectId, changes: $changes) {
      ok
      errors
    }
  }
`
