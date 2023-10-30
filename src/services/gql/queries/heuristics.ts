import { gql } from "@apollo/client";

export const GET_HEURISTICS_OVERVIEW_DATA = gql`
query($projectId:ID!){
  informationSourcesOverviewData(projectId:$projectId)
}
`;