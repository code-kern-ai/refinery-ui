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

export const UPDATE_KNOWLEDGE_BASE = gql`
mutation ($projectId: ID!, $knowledgeBaseId: ID!, $name: String, $description: String) {
  updateKnowledgeBase(projectId: $projectId, knowledgeBaseId: $knowledgeBaseId, name: $name, description: $description) {
    ok
  }
}
`;