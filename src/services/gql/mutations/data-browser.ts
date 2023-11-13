import { gql } from "@apollo/client";

export const DELETE_DATA_SLICE = gql`
mutation($projectId: ID!, $dataSliceId: ID!){
  deleteDataSlice(projectId: $projectId, dataSliceId: $dataSliceId){
    ok
  }
}
`;

export const CREATE_DATA_SLICE = gql`
mutation($projectId: ID!, $name: String!, $static: Boolean!, $filterRaw: JSONString!, $filterData: [JSONString]!){
  createDataSlice(projectId: $projectId, name: $name, static: $static, filterRaw: $filterRaw, filterData: $filterData){
    id
  }
}
`;

export const UPDATE_DATA_SLICE = gql`
mutation($projectId: ID!, $dataSliceId: ID!, $static: Boolean!, $filterRaw: JSONString!, $filterData: [JSONString]){
  updateDataSlice(projectId: $projectId, dataSliceId: $dataSliceId, static: $static, filterRaw: $filterRaw, filterData: $filterData){
    ok
  }
}
`;

export const CREATE_OUTLIER_SLICE = gql`
mutation($projectId: ID!, $embeddingId: ID!){
  createOutlierSlice(projectId: $projectId, embeddingId: $embeddingId) {
    ok
  } 
}
`;