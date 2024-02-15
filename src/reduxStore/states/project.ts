import { Project } from '@/src/types/components/projects/projects-list'
import { postProcessProjectsList } from '@/src/util/components/projects/projects-list-helper'
import { arrayToDict } from '@/submodules/javascript-functions/general'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type ProjectState = {
  all: Project[]
  active: Project | null
}

function getInitState(): ProjectState {
  return {
    all: null,
    active: null,
  }
}

function changeAllFor(obj: any, changes: { [key: string]: any }) {
  for (const key in changes) obj[key] = changes[key]
}

const initialState = getInitState()

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setActiveProject(state, action: PayloadAction<Project>) {
      if (action.payload) state.active = { ...action.payload }
      else state.active = null
    },
    updateProjectState: {
      reducer(state, action: PayloadAction<any[]>) {
        if (action.payload.length !== 2)
          throw new Error(
            'updateProject must be called with exactly 2 arguments',
          )
        const [projectId, changes] = action.payload
        if (state.active && state.active.id === projectId)
          changeAllFor(state.active, changes)

        const project = state.all.find((project) => project.id === projectId)
        if (project) changeAllFor(project, changes)
      },
      prepare(projectId: string, changes: { [key: string]: any }) {
        return {
          payload: [projectId, changes],
        }
      },
    },
    setAllProjects(state, action: PayloadAction<Project[]>) {
      if (action.payload) state.all = postProcessProjectsList(action.payload)
      else state.all = []
    },
    extendAllProjects(state, action: PayloadAction<Project | any>) {
      if (action.payload) state.all.push(action.payload)
    },
    removeFromAllProjects(state, action: PayloadAction<Project>) {
      if (action.payload)
        state.all = state.all.filter(
          (project) => project.id !== action.payload.id,
        )
    },
    removeFromAllProjectsById(state, action: PayloadAction<string>) {
      if (action.payload)
        state.all = state.all.filter((project) => project.id !== action.payload)
    },
  },
})

//selectors
export const selectProject = (state) => state.projects.active
export const selectProjectId = (state) => state.projects.active?.id
export const selectAllProjects = (state) => state.projects.all
export const selectAllProjectsNames = createSelector(
  [selectAllProjects],
  (a): any => (a ? a.map((a) => a.name) : null),
)
export const selectAllProjectsNamesDict = createSelector(
  [selectAllProjects],
  (a): any => (a ? arrayToDict(a, 'id') : null),
)

export const {
  updateProjectState,
  setActiveProject,
  setAllProjects,
  extendAllProjects,
  removeFromAllProjectsById,
} = projectSlice.actions
export const projectReducer = projectSlice.reducer
