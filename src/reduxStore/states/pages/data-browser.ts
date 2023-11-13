import { DataSlice, LineBreaksType, SearchRecordsExtended } from '@/src/types/components/projects/projectId/data-browser/data-browser';
import { arrayToDict } from '@/submodules/javascript-functions/general';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type DataBrowserState = {
    all: DataSlice[];
    active: DataSlice | null;
    additionalData: {
        displayOutdatedWarning: boolean;
        staticDataSliceCurrentCount: number;
        staticSliceOrderActive: boolean;
        loading: boolean;
    },
    usersMapCount: any;
    searchRecordsExtended: SearchRecordsExtended;
    similaritySearch: {
        recordsInDisplay: boolean
    },
    activeSearchParams: any[];
    configuration: {
        weakSupervisionRelated: boolean;
        lineBreaks: LineBreaksType;
    }
}

function getInitState(): DataBrowserState {
    return {
        all: [],
        active: null,
        additionalData: {
            displayOutdatedWarning: false,
            staticDataSliceCurrentCount: 0,
            staticSliceOrderActive: false,
            loading: false,
        },
        usersMapCount: {},
        searchRecordsExtended: {
            fullCount: 0,
            queryLimit: 0,
            queryOffset: 0,
            recordList: [],
            sessionId: ""
        },
        similaritySearch: {
            recordsInDisplay: false
        },
        activeSearchParams: [],
        configuration: {
            weakSupervisionRelated: false,
            lineBreaks: LineBreaksType.NORMAL
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
        setUsersMapCount(state, action: PayloadAction<any>) {
            if (action.payload) state.usersMapCount = action.payload;
            else state.usersMapCount = {};
        },
        setSearchRecordsExtended(state, action: PayloadAction<SearchRecordsExtended>) {
            if (action.payload) state.searchRecordsExtended = action.payload;
            else state.searchRecordsExtended = {
                fullCount: 0,
                queryLimit: 0,
                queryOffset: 0,
                recordList: [],
                sessionId: ""
            };
        },
        setActiveSearchParams(state, action: PayloadAction<any[]>) {
            if (action.payload) state.activeSearchParams = action.payload;
            else state.activeSearchParams = [];
        },
        extendAllDataSlices(state, action: PayloadAction<any>) {
            if (action.payload) state.all.push(action.payload);
        },
    },
})


//selectors
export const selectActiveSlice = (state) => state.dataBrowser.active;
export const selectDataSlicesAll = selectDataSlicesFunc(true);
export const selectDataSlicesDict = selectDataSlicesFunc(false);
export const selectAdditionalData = (state) => state.dataBrowser.additionalData;
export const selectUsersCount = (state) => state.dataBrowser.usersMapCount;
export const selectRecords = (state) => state.dataBrowser.searchRecordsExtended;
export const selectSimilaritySearch = (state) => state.dataBrowser.similaritySearch;
export const selectActiveSearchParams = (state) => state.dataBrowser.activeSearchParams;
export const selectConfiguration = (state) => state.dataBrowser.configuration;

export function selectDataSlicesFunc(asArray: boolean = false) {
    if (asArray) return (state) => state.dataBrowser.all;
    else return (state) => arrayToDict(state.dataBrowser.all, 'id');
}


export const { setDataSlices, setActiveDataSlice, removeFromAllDataSlicesById, updateDataSlicesState, setUsersMapCount, setSearchRecordsExtended, setActiveSearchParams, extendAllDataSlices } = dataBrowserSlice.actions;
export const dataBrowserReducer = dataBrowserSlice.reducer;