import { gql } from '@apollo/client';

export const USER_ROLES = gql`
query{
  userRoles
}
`;