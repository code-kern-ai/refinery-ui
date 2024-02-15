import { LookupList } from '@/src/types/components/projects/projectId/lookup-lists'
import { postProcessLookupLists } from '@/src/util/components/projects/projectId/lookup-lists-helper'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type LookupListsState = {
  all: LookupList[]
  active: LookupList | null
  checked: boolean[]
}

function getInitState(): LookupListsState {
  return {
    all: [],
    active: null,
    checked: [],
  }
}

function changeAllFor(obj: any, changes: { [key: string]: any }) {
  for (const key in changes) obj[key] = changes[key]
}

const initialState = getInitState()

const lookupListsSlice = createSlice({
  name: 'lookupLists',
  initialState,
  reducers: {
    setActiveLookupList(state, action: PayloadAction<LookupList>) {
      if (action.payload) state.active = { ...action.payload }
      else state.active = null
    },
    updateLookupListState: {
      reducer(state, action: PayloadAction<any[]>) {
        if (action.payload.length !== 2)
          throw new Error(
            'updateLookupList must be called with exactly 2 arguments',
          )
        const [lookupListId, changes] = action.payload
        if (state.active && state.active.id === lookupListId)
          changeAllFor(state.active, changes)

        const lookupList = state.all.find(
          (lookupList) => lookupList.id === lookupListId,
        )
        if (lookupList) changeAllFor(lookupList, changes)
      },
      prepare(lookupListId: string, changes: { [key: string]: any }) {
        return {
          payload: [lookupListId, changes],
        }
      },
    },
    setAllLookupLists(state, action: PayloadAction<LookupList[]>) {
      if (action.payload) state.all = postProcessLookupLists(action.payload)
      else state.all = []
    },
    extendAllLookupLists(state, action: PayloadAction<LookupList>) {
      if (action.payload) state.all.push(action.payload)
    },
    removeFromAllLookupListById(state, action: PayloadAction<string>) {
      if (action.payload)
        state.all = state.all.filter(
          (lookupList) => lookupList.id !== action.payload,
        )
    },
    setCheckedLookupLists(state, action: PayloadAction<boolean[]>) {
      if (action.payload) state.checked = action.payload
      else state.checked = []
    },
  },
})

//selectors
export const selectLookupList = (state) => state.lookupLists.active
export const selectLookupListId = (state) => state.lookupLists.active?.id
export const selectAllLookupLists = (state) => state.lookupLists.all
export const selectCheckedLookupLists = (state) => state.lookupLists.checked

export const {
  updateLookupListState,
  setActiveLookupList,
  setAllLookupLists,
  extendAllLookupLists,
  removeFromAllLookupListById,
  setCheckedLookupLists,
} = lookupListsSlice.actions
export const lookupListsReducer = lookupListsSlice.reducer
