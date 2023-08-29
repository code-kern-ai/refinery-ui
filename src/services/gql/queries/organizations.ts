import { gql } from "@apollo/client";

export const GET_USER_INFO = gql`
query {
  userInfo {
    id
    firstName
    lastName
    mail
    role
  }
}
`;