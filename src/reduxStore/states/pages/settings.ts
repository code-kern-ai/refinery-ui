import { Attribute, AttributeState } from '@/src/types/components/projects/projectId/settings/data-schema';
import { Embedding, RecommendedEncoder } from '@/src/types/components/projects/projectId/settings/embeddings';
import { LabelingTask } from '@/src/types/components/projects/projectId/settings/labeling-tasks';
import { DataTypeEnum } from '@/src/types/shared/general';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type SettingsState = {
    attributes: {
        all: Attribute[];
        useableEmbedableAttributes: Attribute[];
        useableNonTextAttributes: Attribute[];
        usableAttributes: any[];
    },
    embeddings: {
        all: Embedding[];
    },
    recommendedEncodersDict: { [embeddingId: string]: RecommendedEncoder };
    recommendedEncodersAll: RecommendedEncoder[];
    labelingTasks: {
        all: LabelingTask[];
    }
}

function getInitState(): SettingsState {
    return {
        attributes: {
            all: [],
            useableEmbedableAttributes: [],
            useableNonTextAttributes: [],
            usableAttributes: []
        },
        embeddings: {
            all: []
        },
        recommendedEncodersDict: {},
        recommendedEncodersAll: [],
        labelingTasks: {
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
        },
        setAllRecommendedEncodersDict(state, action: PayloadAction<{ [embeddingId: string]: RecommendedEncoder }>) {
            if (action.payload) state.recommendedEncodersDict = action.payload;
            else state.recommendedEncodersDict = {};
        },
        setRecommendedEncodersAll(state, action: PayloadAction<RecommendedEncoder[]>) {
            if (action.payload) state.recommendedEncodersAll = action.payload;
            else state.recommendedEncodersAll = [];
        },
        setUseableNonTextAttributes(state, action: PayloadAction<Attribute[]>) {
            if (action.payload) state.attributes.useableNonTextAttributes =
                state.attributes.all.filter((attribute) => attribute.dataType !== DataTypeEnum.TEXT &&
                    (attribute.state === AttributeState.UPLOADED || attribute.state === AttributeState.AUTOMATICALLY_CREATED || attribute.state === AttributeState.USABLE));
            else state.attributes.useableNonTextAttributes = [];
        },
        setLabelingTasksAll(state, action: PayloadAction<LabelingTask[]>) {
            if (action.payload) state.labelingTasks.all = action.payload;
            else state.labelingTasks.all = [];
        },
        removeFromAllLabelingTasksById(state, action: PayloadAction<string>) {
            if (action.payload) state.labelingTasks.all = state.labelingTasks.all.filter((labelingTask) => labelingTask.id !== action.payload);
        },
        setAllUsableAttributes(state, action: PayloadAction<Attribute[]>) {
            if (action.payload) {
                const fullRecordEl = {
                    id: '@@NO_ATTRIBUTE@@',
                    name: 'Full Record'
                }
                const filterFromAll = state.attributes.all.filter((attribute) => (attribute.state === AttributeState.UPLOADED || attribute.state === AttributeState.AUTOMATICALLY_CREATED || attribute.state === AttributeState.USABLE));
                state.attributes.usableAttributes = [fullRecordEl, ...filterFromAll];
            }
            else state.attributes.usableAttributes = [];
        }
    }
});

//selectors
export const selectAttributes = (state) => state.settings.attributes.all;
export const selectEmbeddings = (state) => state.settings.embeddings.all;
export const selectUseableEmbedableAttributes = (state) => state.settings.attributes.useableEmbedableAttributes;
export const selectRecommendedEncodersDict = (state) => state.settings.recommendedEncodersDict;
export const selectRecommendedEncodersAll = (state) => state.settings.recommendedEncodersAll;
export const selectUsableNonTextAttributes = (state) => state.settings.attributes.useableNonTextAttributes;
export const selectLabelingTasksAll = (state) => state.settings.labelingTasks.all;
export const selectUsableAttributes = (state) => state.settings.attributes.usableAttributes;

export const { setAllAttributes, extendAllAttributes, removeFromAllAttributesById, updateAttributeById, setAllEmbeddings, removeFromAllEmbeddingsById, setUseableEmbedableAttributes, setAllRecommendedEncodersDict, setRecommendedEncodersAll, setUseableNonTextAttributes, setLabelingTasksAll, removeFromAllLabelingTasksById, setAllUsableAttributes } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;