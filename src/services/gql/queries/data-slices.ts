import { gql } from "@apollo/client";

export const DATA_SLICES = gql`
query($projectId:ID!,$sliceType:String){
  dataSlices(projectId:$projectId, sliceType:$sliceType){
    id
    name
    filterRaw
    filterData
    count
    static
    createdAt
    createdBy
    sliceType
    info
  }
}
`;

export const SEARCH_RECORDS_EXTENDED = gql`
query ($projectId: ID!, $filterData: [JSONString]!, $offset: Int, $limit: Int) {
  searchRecordsExtended(projectId: $projectId, filterData: $filterData, offset: $offset, limit: $limit) {
    queryLimit
    queryOffset
    fullCount
    sessionId
    recordList {
      recordData
    }
  }
}

`;