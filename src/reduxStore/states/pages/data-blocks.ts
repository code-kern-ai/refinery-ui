import { DataBlock, DataBlockType } from '@/src/types/components/projects/projectId/data-blocks/data-blocks';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type DataBlocksState = {
    all: DataBlock[];
    active: DataBlock | null;
    type: DataBlockType;
}

function getInitState(): DataBlocksState {
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
    },
})


//selectors
export const selectDataBlock = (state) => state.dataBlocks.active;
export const selectDataBlocksAll = (state) => state.dataBlocks.all;
export const selectDataBlockType = (state) => state.dataBlocks.type;

export const { setAllDataBlocks, setDataBlockType, setActiveDataBlock, updateDataBlocksState } = dataBlocksSlice.actions;
export const dataBlocksReducer = dataBlocksSlice.reducer;