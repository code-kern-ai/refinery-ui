import { gql } from "@apollo/client";

export const CREATE_ORGANIZATION = gql`
mutation ($name: String!) {
  createOrganization(name: $name) {
    organization {
      id
    }
  }
}
`;

export const ADD_USER_TO_ORGANIZATION = gql`
mutation ($userMail: String!, $organizationName: String!) {
  addUserToOrganization(userMail: $userMail, organizationName: $organizationName) {
    ok
  }
}
`;

export const CHANGE_ORGANIZATION = gql`
mutation ($orgId: ID!, $changes: JSONString!) {
  changeOrganization(orgId: $orgId, changes: $changes) {
    ok
  }
}
`;

export const UPDATE_CONFIG = gql`
mutation ($dictStr: String!) {
  updateConfig(dictStr: $dictStr) {
    ok
  }
}      
`;