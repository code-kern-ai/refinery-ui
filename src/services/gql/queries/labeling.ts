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