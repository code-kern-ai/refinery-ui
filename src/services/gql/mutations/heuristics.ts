import { gql } from '@apollo/client'

export const TOGGLE_HEURISTICS_SELECTED = gql`
  mutation ($projectId: ID!, $informationSourceId: ID!) {
    toggleInformationSource(
      projectId: $projectId
      informationSourceId: $informationSourceId
    ) {
      ok
    }
  }
`

export const SET_ALL_HEURISTICS = gql`
  mutation ($projectId: ID!, $value: Boolean!) {
    setAllInformationSourceSelected(projectId: $projectId, value: $value) {
      ok
    }
  }
`

export const DELETE_HEURISTIC = gql`
  mutation ($projectId: ID!, $informationSourceId: ID!) {
    deleteInformationSource(
      projectId: $projectId
      informationSourceId: $informationSourceId
    ) {
      ok
    }
  }
`

export const CREATE_HEURISTIC = gql`
  mutation (
    $projectId: ID!
    $labelingTaskId: ID!
    $description: String!
    $sourceCode: String!
    $name: String!
    $type: String!
  ) {
    createInformationSource(
      projectId: $projectId
      labelingTaskId: $labelingTaskId
      type: $type
      description: $description
      sourceCode: $sourceCode
      name: $name
    ) {
      informationSource {
        id
        name
        createdAt
        sourceCode
        description
        isSelected
        projectId
      }
    }
  }
`

export const CREATE_ZERO_SHOT_INFORMATION_SOURCE = gql`
  mutation (
    $projectId: ID!
    $targetConfig: String!
    $labelingTaskId: ID!
    $attributeId: ID
  ) {
    createZeroShotInformationSource(
      projectId: $projectId
      targetConfig: $targetConfig
      labelingTaskId: $labelingTaskId
      attributeId: $attributeId
    ) {
      id
    }
  }
`

export const START_WEAK_SUPERVISIONS = gql`
  mutation ($projectId: ID!) {
    initiateWeakSupervisionByProjectId(projectId: $projectId) {
      ok
    }
  }
`

export const CREATE_INFORMATION_SOURCE_PAYLOAD = gql`
  mutation ($projectId: ID!, $informationSourceId: ID!) {
    createPayload(
      projectId: $projectId
      informationSourceId: $informationSourceId
    ) {
      queueId
    }
  }
`

export const RUN_ZERO_SHOT_PROJECT = gql`
  mutation ($projectId: ID!, $informationSourceId: ID!) {
    zeroShotProject(
      projectId: $projectId
      informationSourceId: $informationSourceId
    ) {
      ok
    }
  }
`

export const UPDATE_INFORMATION_SOURCE = gql`
  mutation (
    $projectId: ID!
    $informationSourceId: ID!
    $labelingTaskId: ID!
    $code: String
    $description: String
    $name: String
  ) {
    updateInformationSource(
      projectId: $projectId
      informationSourceId: $informationSourceId
      labelingTaskId: $labelingTaskId
      code: $code
      description: $description
      name: $name
    ) {
      ok
    }
  }
`

export const RUN_HEURISTIC_THEN_TRIGGER_WEAK_SUPERVISION = gql`
  mutation ($projectId: ID!, $informationSourceId: ID!, $labelingTaskId: ID!) {
    runHeuristicThenTriggerWeakSupervision(
      projectId: $projectId
      informationSourceId: $informationSourceId
      labelingTaskId: $labelingTaskId
    ) {
      ok
    }
  }
`

export const CANCEL_ZERO_SHOT_RUN = gql`
  mutation ($projectId: ID!, $informationSourceId: ID!, $payloadId: ID!) {
    cancelZeroShotRun(
      projectId: $projectId
      informationSourceId: $informationSourceId
      payloadId: $payloadId
    ) {
      ok
    }
  }
`

export const CREATE_ACCESS_LINK = gql`
  mutation ($projectId: ID!, $id: ID!, $type: String!) {
    generateAccessLink(projectId: $projectId, id: $id, type: $type) {
      link {
        id
        link
        isLocked
      }
    }
  }
`

export const REMOVE_ACCESS_LINK = gql`
  mutation ($projectId: ID!, $linkId: ID!) {
    removeAccessLink(projectId: $projectId, linkId: $linkId) {
      ok
    }
  }
`

export const LOCK_ACCESS_LINK = gql`
  mutation ($projectId: ID!, $linkId: ID!, $lockState: Boolean) {
    lockAccessLink(
      projectId: $projectId
      linkId: $linkId
      lockState: $lockState
    ) {
      ok
    }
  }
`
