import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type Project = {
    id: string;
}

type ProjectState = {
    all: Project[];
    active: Project | null;
}


function getInitState(): ProjectState {
    return {
        all: [],
        active: null
    };
}

function changeAllFor(obj: any, changes: { [key: string]: any }) {
    for (const key in changes) obj[key] = changes[key];
}


const initialState = getInitState();

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        setActiveProject(state, action: PayloadAction<Project>) {
            if (action.payload) state.active = { ...action.payload };
            else state.active = null;
        },
        updateProjectState: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateProject must be called with exactly 2 arguments");
                const [projectId, changes] = action.payload;
                if (state.active && state.active.id === projectId) changeAllFor(state.active, changes);

                const project = state.all.find((project) => project.id === projectId);
                if (project) changeAllFor(project, changes);

            },
            prepare(projectId: string, changes: { [key: string]: any }) {
                return {
                    payload: [projectId, changes]
                };
            },
        },
        setAllProjects(state, action: PayloadAction<Project[]>) {
            if (action.payload) state.all = action.payload;
            else state.all = [];
        },
        extendAllProjects(state, action: PayloadAction<Project>) {
            if (action.payload) state.all.push(action.payload);
        },
        removeFromAllProjects(state, action: PayloadAction<Project>) {
            if (action.payload) state.all = state.all.filter((project) => project.id !== action.payload.id);
        },
        removeFromAllProjectsById(state, action: PayloadAction<string>) {
            if (action.payload) state.all = state.all.filter((project) => project.id !== action.payload);
        },
    },
})


//selectors
export const selectProject = (state) => state.projects.active;
export const selectProjectId = (state) => state.projects.active?.id;
export const selectAllProjects = (state) => state.projects.all;

export const { updateProjectState, setActiveProject, setAllProjects, extendAllProjects, removeFromAllProjectsById } = projectSlice.actions;
export const projectReducer = projectSlice.reducer;