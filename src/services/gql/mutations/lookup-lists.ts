import { gql } from "@apollo/client";

export const CREATE_LOOKUP_LIST = gql`
mutation ($projectId: ID!) {
  createKnowledgeBase(projectId: $projectId) {
    knowledgeBase {
      id
      name
      description
      termCount
    }
  }
}
`;

export const DELETE_LOOKUP_LIST = gql`
mutation ($projectId: ID!, $knowledgeBaseId: ID!) {
  deleteKnowledgeBase(projectId: $projectId, knowledgeBaseId: $knowledgeBaseId) {
    ok
  }
}
`;
