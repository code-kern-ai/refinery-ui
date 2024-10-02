import { DataSlice, LineBreaksType, SearchRecordsExtended } from '@/src/types/components/projects/projectId/data-browser/data-browser';
import { postProcessDataSlices, postProcessRecordComments } from '@/src/util/components/projects/projectId/data-browser/data-browser-helper';
import { SearchGroup, Slice } from '@/submodules/javascript-functions/enums/enums';
import { arrayToDict } from '@/submodules/javascript-functions/general';
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type DataBrowserState = {
    all: DataSlice[] | any[];
    active: DataSlice | null;
    additionalData: {
        displayOutdatedWarning: boolean;
        staticDataSliceCurrentCount: number;
        staticSliceOrderActive: boolean;
        loading: boolean;
        clearFullSearch: boolean;
        canUpdateDynamicSlice: boolean;
    },
    searchRecordsExtended: SearchRecordsExtended;
    similaritySearch: {
        recordsInDisplay: boolean
    },
    activeSearchParams: any[];
    configuration: {
        weakSupervisionRelated: boolean;
        lineBreaks: LineBreaksType;
        highlightText: boolean;
        separator: string;
    },
    textHighlight: string[];
    isTextHighlightNeeded: { [key: string]: boolean };
    recordComments: any;
    uniqueValuesDict: { [key: string]: string[] };
    fullSearch: any;
    searchGroups: any;
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
            clearFullSearch: false,
            canUpdateDynamicSlice: false
        },
        searchRecordsExtended: {
            fullCount: 0,
            queryLimit: 0,
            queryOffset: 0,
            recordList: null,
            sessionId: ""
        },
        similaritySearch: {
            recordsInDisplay: false
        },
        activeSearchParams: [],
        configuration: {
            weakSupervisionRelated: false,
            lineBreaks: LineBreaksType.NORMAL,
            highlightText: true,
            separator: ","
        },
        textHighlight: [],
        isTextHighlightNeeded: {},
        recordComments: {},
        uniqueValuesDict: {},
        fullSearch: {
            [SearchGroup.DRILL_DOWN]: false
        },
        searchGroups: {}
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
            if (action.payload) state.all = postProcessDataSlices(action.payload);
            else state.all = [];
            const allRecords = {
                name: 'All Records',
                id: '@@NO_SLICE@@',
                sliceType: Slice.STATIC_DEFAULT
            }
            state.all = [allRecords, ...state.all];
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
        updateConfigurationState: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateConfigurationState must be called with exactly 2 arguments");
                const [confField, changes] = action.payload;
                state.configuration[confField] = changes;
            },
            prepare(confField: string, changes: any) {
                return {
                    payload: [confField, changes]
                };
            },
        },
        updateAdditionalDataState: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateAdditionalDataState must be called with exactly 2 arguments");
                const [additionalDataField, changes] = action.payload;
                state.additionalData[additionalDataField] = changes;
            },
            prepare(additionalDataField: string, changes: any) {
                return {
                    payload: [additionalDataField, changes]
                };
            },
        },
        setTextHighlight(state, action: PayloadAction<string[]>) {
            if (action.payload) state.textHighlight = action.payload;
            else state.textHighlight = [];
        },
        setIsTextHighlightNeeded(state, action: PayloadAction<{ [key: string]: boolean }>) {
            if (action.payload) state.isTextHighlightNeeded = action.payload;
            else state.isTextHighlightNeeded = {};
        },
        setRecordComments(state, action: PayloadAction<any>) {
            if (action.payload) state.recordComments = postProcessRecordComments(action.payload);
            else state.recordComments = {};
        },
        setRecordsInDisplay(state, action: PayloadAction<boolean>) {
            if (action.payload) state.similaritySearch.recordsInDisplay = action.payload;
            else state.similaritySearch.recordsInDisplay = false;
        },
        expandRecordList(state, action: PayloadAction<any>) {
            if (action.payload) {
                state.searchRecordsExtended.fullCount = action.payload.fullCount;
                state.searchRecordsExtended.queryLimit = action.payload.queryLimit;
                state.searchRecordsExtended.queryOffset = action.payload.queryOffset;
                state.searchRecordsExtended.recordList = [...state.searchRecordsExtended.recordList, ...action.payload.recordList];
                state.searchRecordsExtended.sessionId = action.payload.sessionId;
            }
        },
        setUniqueValuesDict(state, action: PayloadAction<{ [key: string]: string[] }>) {
            if (action.payload) state.uniqueValuesDict = action.payload;
            else state.uniqueValuesDict = {};
        },
        setFullSearchStore(state, action: PayloadAction<any>) {
            if (action.payload) state.fullSearch = action.payload;
            else state.fullSearch = {};
        },
        updateFullSearchState: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateFullSearchState must be called with exactly 2 arguments");
                const [fullSearchField, changes] = action.payload;
                state.fullSearch[fullSearchField] = changes;
            },
            prepare(fullSearchField: string, changes: any) {
                return {
                    payload: [fullSearchField, changes]
                };
            },
        },
        setSearchGroupsStore(state, action: PayloadAction<any>) {
            if (action.payload) state.searchGroups = action.payload;
            else state.searchGroups = {};
        }
    },
})


//selectors
export const selectActiveSlice = (state) => state.dataBrowser.active;
export const selectDataSlices = (state) => state.dataBrowser.all;
export const selectAdditionalData = (state) => state.dataBrowser.additionalData;
export const selectRecords = (state) => state.dataBrowser.searchRecordsExtended;
export const selectSimilaritySearch = (state) => state.dataBrowser.similaritySearch;
export const selectActiveSearchParams = (state) => state.dataBrowser.activeSearchParams;
export const selectConfiguration = (state) => state.dataBrowser.configuration;
export const selectTextHighlight = (state) => state.dataBrowser.textHighlight;
export const selectIsTextHighlightNeeded = (state) => state.dataBrowser.isTextHighlightNeeded;
export const selectRecordComments = (state) => state.dataBrowser.recordComments;
export const selectUniqueValuesDict = (state) => state.dataBrowser.uniqueValuesDict;
export const selectFullSearchStore = (state) => state.dataBrowser.fullSearch;
export const selectSearchGroupsStore = (state) => state.dataBrowser.searchGroups;

export const selectDataSlicesAll = createSelector([selectDataSlices], (d): any => d ? d.filter((slice) => slice.id != '@@NO_SLICE@@') : null);
export const selectDataSlicesDict = createSelector([selectDataSlicesAll], (a): any => a ? arrayToDict(a, 'id') : null);
export const selectStaticSlices = createSelector([selectDataSlices], (a): any => a ? a.filter((slice) => slice.sliceType == Slice.STATIC_DEFAULT) : null);

export const { setDataSlices, setActiveDataSlice, removeFromAllDataSlicesById, updateDataSlicesState, setSearchRecordsExtended, setActiveSearchParams, extendAllDataSlices, updateConfigurationState, updateAdditionalDataState, setTextHighlight, setIsTextHighlightNeeded, setRecordComments, setRecordsInDisplay, expandRecordList, setUniqueValuesDict, setFullSearchStore, updateFullSearchState, setSearchGroupsStore } = dataBrowserSlice.actions;
export const dataBrowserReducer = dataBrowserSlice.reducer;