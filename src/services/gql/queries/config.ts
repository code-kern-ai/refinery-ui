import { gql } from "@apollo/client";

export const GET_IS_ADMIN = gql`
query {
    isAdmin
}
`;