import { KnowledgeGraph, KnowledgeGraphType } from '@/src/types/components/projects/projectId/knowledge-graphs/knowledge-graphs';
import { InformationSourceType } from '@/submodules/javascript-functions/enums/enums';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type KnowledgeGraphsState = {
    all: KnowledgeGraph[];
    active: KnowledgeGraph | null;
    type: KnowledgeGraphType;
}

function getInitState(): KnowledgeGraphsState {
    return {
        all: [],
        active: null,
        type: null,
    };
}

function changeAllFor(obj: any, changes: { [key: string]: any }) {
    for (const key in changes) obj[key] = changes[key];
}

const initialState = getInitState();

const knowledgeGraphsSlice = createSlice({
    name: 'knowledgeGraphs',
    initialState,
    reducers: {
        setActiveKnowledgeGraph(state, action: PayloadAction<KnowledgeGraph>) {
            if (action.payload) state.active = { ...action.payload };
            else state.active = null;
        },
        setAllKnowledgeGraphs(state, action: PayloadAction<KnowledgeGraph[]>) {
            if (action.payload) state.all = action.payload;
            else state.all = [];
        },
        setKnowledgeGraphType(state, action: PayloadAction<KnowledgeGraphType>) {
            state.type = action.payload;
        }
    },
})


//selectors
export const selectKnowledgeGraph = (state) => state.knowledgeGraphs.active;
export const selectKnowledgeGraphsAll = (state) => state.knowledgeGraphs.all;
export const selectKnowledgeGraphType = (state) => state.knowledgeGraphs.type;

export const { setAllKnowledgeGraphs, setKnowledgeGraphType, setActiveKnowledgeGraph } = knowledgeGraphsSlice.actions;
export const knowledgeGraphsReducer = knowledgeGraphsSlice.reducer;