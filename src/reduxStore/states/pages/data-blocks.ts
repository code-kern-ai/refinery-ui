import { DataBlock, DataBlockColumn, DataBlockType } from '@/src/types/components/projects/projectId/data-blocks/data-blocks';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type DataBlocksState = {
    all: DataBlock[];
    active: DataBlock | null;
    type: DataBlockType;
    allDataBlockColumns: DataBlockColumn[];
    activeDataBlockColumn: DataBlockColumn | null;
}

function getInitState(): DataBlocksState {
    return {
        all: [],
        active: null,
        type: null,
        allDataBlockColumns: [],
        activeDataBlockColumn: null,
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
        setActiveDataBlockColumn(state, action: PayloadAction<DataBlockColumn>) {
            if (action.payload) state.activeDataBlockColumn = { ...action.payload };
            else state.activeDataBlockColumn = null;
        },
        setAllDataBlockColumns(state, action: PayloadAction<DataBlockColumn[]>) {
            if (action.payload) state.allDataBlockColumns = action.payload;
            else state.allDataBlockColumns = [];
        },
    },
})


//selectors
export const selectDataBlock = (state) => state.dataBlocks.active;
export const selectDataBlocksAll = (state) => state.dataBlocks.all;
export const selectDataBlockType = (state) => state.dataBlocks.type;
export const selectActiveDataBlockColumn = (state) => state.dataBlocks.activeDataBlockColumn;
export const selectDataBlockColumns = (state) => state.dataBlocks.allDataBlockColumns;

export const { setAllDataBlocks, setDataBlockType, setActiveDataBlock, updateDataBlocksState, setActiveDataBlockColumn, setAllDataBlockColumns } = dataBlocksSlice.actions;
export const dataBlocksReducer = dataBlocksSlice.reducer;