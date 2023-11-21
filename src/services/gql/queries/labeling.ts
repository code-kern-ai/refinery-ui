import { gql } from "@apollo/client";

export const REQUEST_HUDDLE_DATA = gql`
query ($projectId: ID!, $huddleId: ID!, $huddleType: String!) {
  requestHuddleData(projectId: $projectId, huddleId: $huddleId, huddleType: $huddleType) {
    huddleId
    recordIds
    huddleType
    startPos
    allowedTask
    canEdit
    checkedAt
  }
}

`;

export const AVAILABLE_LABELING_LINKS = gql`
query ($projectId: ID!, $assumedRole: String, $assumedHeuristicId: ID) {
  availableLinks(projectId: $projectId, assumedRole: $assumedRole, assumedHeuristicId: $assumedHeuristicId) {
    id
    linkType
    link
    name
    isLocked
  }
}`;

export const GET_TOKENIZED_RECORD = gql`
query ($recordId: ID!){
  tokenizeRecord(recordId:$recordId) {
    recordId
    attributes {
      raw
      attribute {
        id
        name
      }      
      tokens {
        value
        idx
        posStart
        posEnd
        type
      }
    }
  }
}
`;

export const GET_RECORD_LABEL_ASSOCIATIONS = gql`
query ($projectId: ID!, $recordId: ID!) {
  recordByRecordId(projectId: $projectId, recordId: $recordId) {
    id
    recordLabelAssociations {
      edges {
        node {
          id
          recordId
          labelingTaskLabelId
          sourceId
          sourceType
          returnType
          confidence
          createdAt
          createdBy
          tokenStartIdx
          tokenEndIdx
          isGoldStar
          user {
            id
            firstName
            lastName
            mail
          }
          informationSource {
            type
            returnType
            name
            description
            createdAt
            createdBy
          }
          labelingTaskLabel {
            id
            name
            color
            labelingTask {
              id
              name
              attribute {
                id
                name
                relativePosition
              }
            }
          }
        }
      }
    }
  }
}
`;