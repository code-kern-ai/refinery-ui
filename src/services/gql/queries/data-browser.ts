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

export const SEARCH_SIMILAR_RECORDS = gql`
query ($projectId: ID!, $embeddingId: ID!, $recordId: ID!, $attFilter: JSONString, $recordSubKey:Int) {
  searchRecordsBySimilarity(projectId: $projectId, embeddingId: $embeddingId, recordId: $recordId, attFilter: $attFilter,recordSubKey:$recordSubKey) {
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