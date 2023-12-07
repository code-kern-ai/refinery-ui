import { EditRecordSessionData } from "@/src/types/components/projects/projectId/edit-records";
import { ProjectOverviewFilters } from "@/src/types/components/projects/projectId/project-overview/project-overview";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type TmpState = {
    sessionData: EditRecordSessionData;
    overviewFilters: ProjectOverviewFilters;
}

function getInitState(): TmpState {
    return {
        sessionData: null,
        overviewFilters: null
    };
}

const initialState = getInitState();

const tmpSlice = createSlice({
    name: 'tmp',
    initialState,
    reducers: {
        setSessionData: (state, action: PayloadAction<EditRecordSessionData>) => {
            if (action.payload) state.sessionData = action.payload;
            else state.sessionData = null;
        },
        setOverviewFilters: (state, action: PayloadAction<ProjectOverviewFilters>) => {
            if (action.payload) state.overviewFilters = action.payload;
            else state.overviewFilters = null;
        },
        updateOverFilters: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateOverFilters must be called with exactly 2 arguments");
                const [field, value] = action.payload;
                state.overviewFilters[field] = value;
            },
            prepare(field: string, value: any) {
                return {
                    payload: [field, value]
                };
            },
        },
    },
});

export const selectSessionData = (state) => state.tmp.sessionData;
export const selectOverviewFilters = (state) => state.tmp.overviewFilters;

export const { setSessionData, setOverviewFilters, updateOverFilters } = tmpSlice.actions;

export const tmpReducer = tmpSlice.reducer;
