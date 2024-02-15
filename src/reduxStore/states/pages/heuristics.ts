import { Heuristic } from '@/src/types/components/projects/projectId/heuristics/heuristics'
import { InformationSourceType } from '@/submodules/javascript-functions/enums/enums'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type HeuristicsState = {
  all: Heuristic[]
  active: Heuristic | null
  heuristicType: InformationSourceType
}

function getInitState(): HeuristicsState {
  return {
    all: [],
    active: null,
    heuristicType: null,
  }
}

function changeAllFor(obj: any, changes: { [key: string]: any }) {
  for (const key in changes) obj[key] = changes[key]
}

const initialState = getInitState()

const heuristicsSlice = createSlice({
  name: 'heuristics',
  initialState,
  reducers: {
    setActiveHeuristics(state, action: PayloadAction<Heuristic>) {
      if (action.payload) state.active = { ...action.payload }
      else state.active = null
    },
    updateHeuristicsState: {
      reducer(state, action: PayloadAction<any[]>) {
        if (action.payload.length !== 2)
          throw new Error(
            'updateHeuristicsState must be called with exactly 2 arguments',
          )
        const [heuristicId, changes] = action.payload
        if (state.active && state.active.id === heuristicId)
          changeAllFor(state.active, changes)

        const lookupList = state.all.find(
          (lookupList) => lookupList.id === heuristicId,
        )
        if (lookupList) changeAllFor(lookupList, changes)
      },
      prepare(heuristicId: string, changes: { [key: string]: any }) {
        return {
          payload: [heuristicId, changes],
        }
      },
    },
    setAllHeuristics(state, action: PayloadAction<Heuristic[]>) {
      if (action.payload) state.all = action.payload
      else state.all = []
    },
    extendAllHeuristics(state, action: PayloadAction<Heuristic>) {
      if (action.payload) state.all.push(action.payload)
    },
    removeFromAllHeuristicById(state, action: PayloadAction<string>) {
      if (action.payload)
        state.all = state.all.filter(
          (lookupList) => lookupList.id !== action.payload,
        )
    },
    setHeuristicType(state, action: PayloadAction<InformationSourceType>) {
      state.heuristicType = action.payload
    },
  },
})

//selectors
export const selectHeuristic = (state) => state.heuristics.active
export const selectHeuristicsAll = (state) => state.heuristics.all
export const selectHeuristicType = (state) => state.heuristics.heuristicType

export const {
  updateHeuristicsState,
  setActiveHeuristics,
  setAllHeuristics,
  extendAllHeuristics,
  removeFromAllHeuristicById,
  setHeuristicType,
} = heuristicsSlice.actions
export const heuristicsReducer = heuristicsSlice.reducer
