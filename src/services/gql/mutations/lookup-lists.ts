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

export const ADD_TERM_TO_LOOKUP_LIST = gql`
mutation ($projectId: ID!, $value: String!, $comment: String, $knowledgeBaseId: ID!) {
  addTermToKnowledgeBase(projectId: $projectId, value: $value, comment: $comment, knowledgeBaseId: $knowledgeBaseId) {
    ok
  }
}
`;

export const REMOVE_TERM = gql`
mutation ($projectId: ID!, $termId: ID!) {
  deleteTerm(projectId: $projectId, termId: $termId) {
    ok
  }
}
`;

export const BLACKLIST_TERM = gql`
mutation ($projectId: ID!, $termId: ID!) {
  blacklistTerm(projectId: $projectId, termId: $termId) {
    ok
  }
}
`;

export const PASTE_TERM = gql`
mutation ($projectId: ID!, $knowledgeBaseId: ID!, $values: String!, $split: String, $delete: Boolean) {
  pasteKnowledgeTerms(projectId: $projectId, knowledgeBaseId: $knowledgeBaseId, values: $values, split: $split, delete: $delete) {
    ok
  }
}

`;

export const UPDATE_TERM = gql`
mutation ($projectId: ID!, $termId: ID!, $value: String, $comment: String) {
  updateTerm(projectId: $projectId, termId: $termId, value: $value, comment: $comment) {
    ok
  }
}
`;