import { UploadFileType, UploadTask } from '@/src/types/shared/upload'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type UploadState = {
  uploadFileType: UploadFileType
  importOptions: string
}

function getInitState(): UploadState {
  return {
    uploadFileType: null,
    importOptions: '',
  }
}

const initialState = getInitState()

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setUploadFileType(state, action) {
      state.uploadFileType = action.payload
    },
    setImportOptions(state, action: PayloadAction<string>) {
      state.importOptions = action.payload
    },
  },
})

export const selectUploadData = (state) => state.upload

export const { setUploadFileType, setImportOptions } = uploadSlice.actions

export const uploadReducer = uploadSlice.reducer
