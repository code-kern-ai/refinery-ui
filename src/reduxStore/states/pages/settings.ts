import { Attribute, Embedding } from '@/src/types/components/projects/projectId/settings';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type SettingsState = {
    attributes: {
        all: Attribute[];
    },
    embeddings: {
        all: Embedding[];
    }
}

function getInitState(): SettingsState {
    return {
        attributes: {
            all: []
        },
        embeddings: {
            all: []
        }
    };
}

const initialState = getInitState();

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setAllAttributes(state, action: PayloadAction<Attribute[]>) {
            if (action.payload) state.attributes.all = action.payload;
            else state.attributes.all = [];
        },
        extendAllAttributes(state, action: PayloadAction<Attribute>) {
            if (action.payload) state.attributes.all.push(action.payload);
        },
        removeFromAllAttributesById(state, action: PayloadAction<string>) {
            if (action.payload) state.attributes.all = state.attributes.all.filter((attribute) => attribute.id !== action.payload);
        },
        updateAttributeById(state, action: PayloadAction<Attribute>) {
            if (action.payload) {
                const index = state.attributes.all.findIndex((attribute) => attribute.id === action.payload.id);
                if (index !== -1) state.attributes.all[index] = action.payload;
            }
        },
        setAllEmbeddings(state, action: PayloadAction<Embedding[]>) {
            if (action.payload) state.embeddings.all = action.payload;
            else state.embeddings.all = [];
        }
    },
})


//selectors
export const selectAttributes = (state) => state.settings.attributes.all;
export const selectEmbeddings = (state) => state.settings.embeddings.all;


export const { setAllAttributes, extendAllAttributes, removeFromAllAttributesById, updateAttributeById, setAllEmbeddings } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;