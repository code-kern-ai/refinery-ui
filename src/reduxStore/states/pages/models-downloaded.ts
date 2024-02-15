import { ModelsDownloaded } from '@/src/types/components/models-downloaded/models-downloaded'
import { postProcessingModelsDownload } from '@/src/util/components/models-downloaded/models-downloaded-helper'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type ModelsDownloadedState = {
  modelsDownloaded: ModelsDownloaded[]
}

function getInitState(): ModelsDownloadedState {
  return {
    modelsDownloaded: null,
  }
}

const initialState = getInitState()

const modelsDownloadedSlice = createSlice({
  name: 'modelsDownloaded',
  initialState,
  reducers: {
    setModelsDownloaded(state, action: PayloadAction<ModelsDownloaded[]>) {
      if (action.payload)
        state.modelsDownloaded = postProcessingModelsDownload(action.payload)
      else state.modelsDownloaded = []
    },
    removeModelDownloadByName(state, action: PayloadAction<string>) {
      if (action.payload)
        state.modelsDownloaded = state.modelsDownloaded.filter(
          (model) => model.name !== action.payload,
        )
    },
    extentModelsDownloaded(state, action: PayloadAction<ModelsDownloaded>) {
      if (action.payload) state.modelsDownloaded.push(action.payload)
    },
  },
})

export const selectModelsDownloaded = (state) =>
  state.modelsDownloaded.modelsDownloaded

export const {
  setModelsDownloaded,
  removeModelDownloadByName,
  extentModelsDownloaded,
} = modelsDownloadedSlice.actions

export const modelsDownloadedReducer = modelsDownloadedSlice.reducer
