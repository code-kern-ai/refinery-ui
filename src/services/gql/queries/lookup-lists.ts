import { gql } from '@apollo/client';

export const LOOKUP_LISTS_BY_PROJECT_ID = gql`
query ($projectId: ID!) {
  knowledgeBasesByProjectId(projectId: $projectId) {
      id 
      name
      description
      termCount
  }
}
`;

export const LOOKUP_LIST_BY_LOOKUP_LIST_ID = gql`
query ($projectId: ID!, $knowledgeBaseId: ID!) {
  knowledgeBaseByKnowledgeBaseId(projectId: $projectId, knowledgeBaseId: $knowledgeBaseId) {
      id 
      name
      description
  }
}
`;

export const TERMS_BY_KNOWLEDGE_BASE_ID = gql`
query ($projectId: ID!, $knowledgeBaseId: ID!) {
    termsByKnowledgeBaseId(projectId: $projectId, knowledgeBaseId: $knowledgeBaseId) {
    id
    value
    comment
    blacklisted
  }
}
`;

export const EXPORT_LIST = gql`
query ($projectId: ID!, $listId: ID!) {
  exportKnowledgeBase(projectId: $projectId, listId: $listId) 
}
`;