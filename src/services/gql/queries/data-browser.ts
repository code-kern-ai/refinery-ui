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

export const GET_RECORD_COMMENTS = gql`
query ($projectId: ID!, $recordIds: [ID]!) {
  recordComments(projectId: $projectId, recordIds: $recordIds)
}
`;

export const GET_RECORDS_BY_STATIC_SLICE = gql`
query ($projectId: ID!, $sliceId: ID!, $orderBy: JSONString, $offset: Int, $limit: Int) {
  recordsByStaticSlice(projectId: $projectId, sliceId: $sliceId,orderBy: $orderBy, offset: $offset, limit: $limit) {
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

export const GET_UNIQUE_VALUES_BY_ATTRIBUTES = gql`
query ($projectId: ID!) {
  uniqueValuesByAttributes(projectId: $projectId)
}`;

export const GET_STATIC_DATA_SLICE_CURRENT_COUNT = gql`
query ($projectId: ID!, $sliceId: ID!) {
  staticDataSlicesCurrentCount(projectId: $projectId, sliceId: $sliceId)
}
`;