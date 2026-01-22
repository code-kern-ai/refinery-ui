import { DataBlock, DataBlockColumn, DataBlockColumnState, DataBlockType } from '@/src/types/components/projects/projectId/data-blocks/data-blocks';
import { AttributeState } from '@/src/types/components/projects/projectId/settings/data-schema';
import { arrayToDict } from '@/submodules/javascript-functions/general';
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type DataBlocksState = {
    all: DataBlock[];
    active: DataBlock | null;
    type: DataBlockType;
    allDataBlockColumns: DataBlockColumn[];
    usableDataBlockColumns: DataBlockColumn[];
}

function getInitState(): DataBlocksState {
    return {
        all: [],
        active: null,
        type: null,
        allDataBlockColumns: [],
        usableDataBlockColumns: [],
    };
}

function changeAllFor(obj: any, changes: { [key: string]: any }) {
    for (const key in changes) obj[key] = changes[key];
}

const initialState = getInitState();

const dataBlocksSlice = createSlice({
    name: 'dataBlocks',
    initialState,
    reducers: {
        setActiveDataBlock(state, action: PayloadAction<DataBlock>) {
            if (action.payload) state.active = { ...action.payload };
            else state.active = null;
            if (!state.active) {
                state.usableDataBlockColumns = [];
                return;
            }
            const filterFromAll = state.active.sqlSchema.filter((dataBlockColumn) => (dataBlockColumn.state === DataBlockColumnState.UPLOADED || dataBlockColumn.state === DataBlockColumnState.AUTOMATICALLY_CREATED || dataBlockColumn.state === DataBlockColumnState.USABLE));
            state.usableDataBlockColumns = [...filterFromAll];
        },
        setAllDataBlocks(state, action: PayloadAction<DataBlock[]>) {
            if (action.payload) state.all = action.payload;
            else state.all = [];
        },
        setDataBlockType(state, action: PayloadAction<DataBlockType>) {
            state.type = action.payload;
        },
        updateDataBlocksState: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateDataBlocksState must be called with exactly 2 arguments");
                const [dataBlockId, changes] = action.payload;
                if (state.active && state.active.id === dataBlockId) changeAllFor(state.active, changes);
                const lookupList = state.all.find((lookupList) => lookupList.id === dataBlockId);
                if (lookupList) changeAllFor(lookupList, changes);

            },
            prepare(dataBlockId: string, changes: { [key: string]: any }) {
                return {
                    payload: [dataBlockId, changes]
                };
            },
        },
        updateDataBlockColumnById(state, action: PayloadAction<DataBlockColumn>) {
            if (action.payload) {
                const index = state.allDataBlockColumns.findIndex((dataBlockColumn) => dataBlockColumn.id === action.payload.id);
                if (index !== -1) state.allDataBlockColumns[index] = action.payload;
            }
        },
    },
})


//selectors
export const selectDataBlock = (state) => state.dataBlocks.active;
export const selectDataBlocksAll = (state) => state.dataBlocks.all;
export const selectDataBlockType = (state) => state.dataBlocks.type;
export const selectDataBlockColumns = (state) => state.dataBlocks.active?.sqlSchema || [];
export const selectUsableDataBlockColumns = (state) => state.dataBlocks.usableDataBlockColumns;
export const selectDataBlockColumnsDict = createSelector([selectDataBlockColumns], (a): any => a ? arrayToDict(a, 'id') : null);

export const { setAllDataBlocks, setDataBlockType, setActiveDataBlock, updateDataBlocksState, updateDataBlockColumnById } = dataBlocksSlice.actions;
export const dataBlocksReducer = dataBlocksSlice.reducer;