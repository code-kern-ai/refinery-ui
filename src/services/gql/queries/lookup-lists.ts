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