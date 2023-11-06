import { DataSlice } from '@/src/types/components/projects/projectId/data-browser.ts/data-browser';
import { arrayToDict } from '@/submodules/javascript-functions/general';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type DataBrowserState = {
    all: DataSlice[];
    active: DataSlice | null;
}

function getInitState(): DataBrowserState {
    return {
        all: [],
        active: null,
    };
}

function changeAllFor(obj: any, changes: { [key: string]: any }) {
    for (const key in changes) obj[key] = changes[key];
}

const initialState = getInitState();

const dataBrowserSlice = createSlice({
    name: 'dataBrowser',
    initialState,
    reducers: {
        setDataSlices(state, action: PayloadAction<DataSlice[]>) {
            if (action.payload) state.all = action.payload;
            else state.all = [];
        }
    },
})


//selectors
export const selectDataSlicesAll = selectDataSlicesFunc(true);
export const selectDataSlicesDict = selectDataSlicesFunc(false);

export function selectDataSlicesFunc(asArray: boolean = false) {
    if (asArray) return (state) => state.dataBrowser.all;
    else return (state) => arrayToDict(state.dataBrowser.all, 'id');
}


export const { setDataSlices } = dataBrowserSlice.actions;
export const dataBrowserReducer = dataBrowserSlice.reducer;