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