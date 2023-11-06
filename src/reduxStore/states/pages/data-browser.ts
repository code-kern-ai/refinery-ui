import { DataSlice } from '@/src/types/components/projects/projectId/data-browser.ts/data-browser';
import { arrayToDict } from '@/submodules/javascript-functions/general';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type DataBrowserState = {
    all: DataSlice[];
    active: DataSlice | null;
    additionalData: {
        displayOutdatedWarning: boolean;
        staticDataSliceCurrentCount: number
    }
}

function getInitState(): DataBrowserState {
    return {
        all: [],
        active: null,
        additionalData: {
            displayOutdatedWarning: false,
            staticDataSliceCurrentCount: 0
        }
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
            state.all = [];
            if (action.payload) state.all = action.payload;
            else state.all = [];
        },
        setActiveDataSlice(state, action: PayloadAction<DataSlice>) {
            if (action.payload) state.active = { ...action.payload };
            else state.active = null;
        },
        removeFromAllDataSlicesById(state, action: PayloadAction<string>) {
            if (action.payload) state.all = state.all.filter((slice) => slice.id !== action.payload);
        },
        updateDataSlicesState: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateDataSlicesState must be called with exactly 2 arguments");
                const [dataSliceId, changes] = action.payload;
                if (state.active && state.active.id === dataSliceId) changeAllFor(state.active, changes);

                const dataSlice = state.all.find((lookupList) => lookupList.id === dataSliceId);
                if (dataSlice) changeAllFor(dataSlice, changes);

            },
            prepare(dataSliceId: string, changes: { [key: string]: any }) {
                return {
                    payload: [dataSliceId, changes]
                };
            },
        },
    },
})


//selectors
export const selectActiveSlice = (state) => state.dataBrowser.active;
export const selectDataSlicesAll = selectDataSlicesFunc(true);
export const selectDataSlicesDict = selectDataSlicesFunc(false);
export const selectAdditionalData = (state) => state.dataBrowser.additionalData;

export function selectDataSlicesFunc(asArray: boolean = false) {
    if (asArray) return (state) => state.dataBrowser.all;
    else return (state) => arrayToDict(state.dataBrowser.all, 'id');
}


export const { setDataSlices, setActiveDataSlice, removeFromAllDataSlicesById, updateDataSlicesState } = dataBrowserSlice.actions;
export const dataBrowserReducer = dataBrowserSlice.reducer;