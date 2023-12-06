import { EditRecordSessionData } from "@/src/types/components/projects/projectId/edit-records";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type TmpState = {
    sessionData: EditRecordSessionData;
}

function getInitState(): TmpState {
    return {
        sessionData: null
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
        }
    },
});

export const selectSessionData = (state) => state.tmp.sessionData;

export const { setSessionData } = tmpSlice.actions;

export const tmpReducer = tmpSlice.reducer;
