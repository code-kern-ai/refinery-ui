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