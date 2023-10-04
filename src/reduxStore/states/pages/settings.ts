import { Attribute, AttributeState } from '@/src/types/components/projects/projectId/settings/data-schema';
import { Embedding } from '@/src/types/components/projects/projectId/settings/embeddings';
import { DataTypeEnum } from '@/src/types/shared/general';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type SettingsState = {
    attributes: {
        all: Attribute[];
        useableEmbedableAttributes: Attribute[];
    },
    embeddings: {
        all: Embedding[];
    }
}

function getInitState(): SettingsState {
    return {
        attributes: {
            all: [],
            useableEmbedableAttributes: []
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
        },
        removeFromAllEmbeddingsById(state, action: PayloadAction<string>) {
            if (action.payload) state.embeddings.all = state.embeddings.all.filter((embedding) => embedding.id !== action.payload);
        },
        setUseableEmbedableAttributes(state, action: PayloadAction<Attribute[]>) {
            if (action.payload) state.attributes.useableEmbedableAttributes =
                state.attributes.all.filter((attribute) => (attribute.dataType === DataTypeEnum.TEXT || attribute.dataType === DataTypeEnum.EMBEDDING_LIST) &&
                    (attribute.state === AttributeState.UPLOADED || attribute.state === AttributeState.AUTOMATICALLY_CREATED || attribute.state === AttributeState.USABLE));
            else state.attributes.useableEmbedableAttributes = [];
        }
    },
})


//selectors
export const selectAttributes = (state) => state.settings.attributes.all;
export const selectEmbeddings = (state) => state.settings.embeddings.all;
export const selectUseableEmbedableAttributes = (state) => state.settings.attributes.useableEmbedableAttributes;


export const { setAllAttributes, extendAllAttributes, removeFromAllAttributesById, updateAttributeById, setAllEmbeddings, removeFromAllEmbeddingsById, setUseableEmbedableAttributes } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;