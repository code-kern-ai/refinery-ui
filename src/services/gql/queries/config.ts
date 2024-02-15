import { gql } from '@apollo/client'

export const GET_IS_ADMIN = gql`
  query {
    isAdmin
  }
`

export const GET_VERSION_OVERVIEW = gql`
  query {
    versionOverview {
      service
      installedVersion
      remoteVersion
      lastChecked
      link
      remoteHasNewer
    }
  }
`

export const GET_HAS_UPDATES = gql`
  {
    hasUpdates
  }
`
