import { useQuery } from "@apollo/client";
import { GET_USER_INFO } from "../queries/organizations";

export function getUserInfo() {
    return useQuery(GET_USER_INFO)
}