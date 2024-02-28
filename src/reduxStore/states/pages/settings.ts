import { Attribute, AttributeState, AttributeVisibility } from '@/src/types/components/projects/projectId/settings/data-schema';
import { Embedding, EmbeddingType, RecommendedEncoder } from '@/src/types/components/projects/projectId/settings/embeddings';
import { LabelingTask } from '@/src/types/components/projects/projectId/settings/labeling-tasks';
import { DataTypeEnum } from '@/src/types/shared/general';
import { Status } from '@/src/types/shared/statuses';
import { postProcessingAttributes } from '@/src/util/components/projects/projectId/settings/data-schema-helper';
import { arrayToDict } from '@/submodules/javascript-functions/general';
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type SettingsState = {
    attributes: {
        all: Attribute[];
        useableEmbedableAttributes: Attribute[];
        useableNonTextAttributes: Attribute[];
        usableAttributes: any[];
        usableTextAttributes: any[];
    },
    embeddings: {
        all: Embedding[];
        filtered: Embedding[];
    },
    recommendedEncodersDict: { [embeddingId: string]: RecommendedEncoder };
    recommendedEncodersAll: RecommendedEncoder[];
    labelingTasks: {
        all: LabelingTask[];
    },
    gatesIntegration: any;
}

function getInitState(): SettingsState {
    return {
        attributes: {
            all: [],
            useableEmbedableAttributes: [],
            useableNonTextAttributes: [],
            usableAttributes: [],
            usableTextAttributes: []
        },
        embeddings: {
            all: [],
            filtered: []
        },
        recommendedEncodersDict: {},
        recommendedEncodersAll: [],
        labelingTasks: {
            all: null
        },
        gatesIntegration: null
    };
}

const initialState = getInitState();

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setAllAttributes(state, action: PayloadAction<Attribute[]>) {
            if (action.payload) state.attributes.all = postProcessingAttributes(action.payload);
            else state.attributes.all = [];
            state.attributes.useableEmbedableAttributes = state.attributes.all.filter((attribute) => (attribute.dataType === DataTypeEnum.TEXT || attribute.dataType === DataTypeEnum.EMBEDDING_LIST) &&
                (attribute.state === AttributeState.UPLOADED || attribute.state === AttributeState.AUTOMATICALLY_CREATED || attribute.state === AttributeState.USABLE));
            state.attributes.useableNonTextAttributes = state.attributes.all.filter((attribute) => (attribute.dataType !== DataTypeEnum.TEXT && attribute.dataType !== DataTypeEnum.EMBEDDING_LIST) &&
                (attribute.state === AttributeState.UPLOADED || attribute.state === AttributeState.AUTOMATICALLY_CREATED || attribute.state === AttributeState.USABLE));
            const fullRecordEl = {
                id: '@@NO_ATTRIBUTE@@',
                name: 'Full Record'
            }
            const filterFromAll = state.attributes.all.filter((attribute) => (attribute.state === AttributeState.UPLOADED || attribute.state === AttributeState.AUTOMATICALLY_CREATED || attribute.state === AttributeState.USABLE));
            state.attributes.usableAttributes = [fullRecordEl, ...filterFromAll];
            state.attributes.usableTextAttributes = state.attributes.useableEmbedableAttributes.filter((attribute) => attribute.dataType === DataTypeEnum.TEXT);
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
        setFilteredEmbeddings(state, action: PayloadAction<Embedding[]>) {
            if (action.payload) state.embeddings.filtered = action.payload;
            else state.embeddings.filtered = [];
        },
        removeFromAllEmbeddingsById(state, action: PayloadAction<string>) {
            if (action.payload) state.embeddings.all = state.embeddings.all.filter((embedding) => embedding.id !== action.payload);
        },
        setAllRecommendedEncodersDict(state, action: PayloadAction<{ [embeddingId: string]: RecommendedEncoder }>) {
            if (action.payload) state.recommendedEncodersDict = action.payload;
            else state.recommendedEncodersDict = {};
        },
        setRecommendedEncodersAll(state, action: PayloadAction<RecommendedEncoder[]>) {
            if (action.payload) state.recommendedEncodersAll = action.payload;
            else state.recommendedEncodersAll = [];
        },
        setLabelingTasksAll(state, action: PayloadAction<LabelingTask[]>) {
            if (action.payload) state.labelingTasks.all = action.payload;
            else state.labelingTasks.all = [];
        },
        removeFromAllLabelingTasksById(state, action: PayloadAction<string>) {
            if (action.payload) state.labelingTasks.all = state.labelingTasks.all.filter((labelingTask) => labelingTask.id !== action.payload);
        },
        removeLabelFromLabelingTask: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateProject must be called with exactly 2 arguments");
                const [taskId, labelId] = action.payload;
                const labelingTask = state.labelingTasks.all.find((labelingTask) => labelingTask.id === taskId);
                if (labelingTask) {
                    labelingTask.labels = labelingTask.labels.filter((label) => label.id !== labelId);
                }
            },
            prepare(taskId: string, labelId: string) {
                return {
                    payload: [taskId, labelId]
                };
            }
        },
        setGatesIntegration(state, action: PayloadAction<any>) {
            if (action.payload) state.gatesIntegration = action.payload;
            else state.gatesIntegration = null;
        }
    }
});

//selectors
export const selectAttributes = (state) => state.settings.attributes.all;
export const selectUseableEmbedableAttributes = (state) => state.settings.attributes.useableEmbedableAttributes;
export const selectUsableNonTextAttributes = (state) => state.settings.attributes.useableNonTextAttributes;
export const selectUsableAttributes = (state) => state.settings.attributes.usableAttributes;
export const selectTextAttributes = (state) => state.settings.attributes.usableTextAttributes;
export const selectGatesIntegration = (state) => state.settings.gatesIntegration;

export const selectEmbeddings = (state) => state.settings.embeddings.all;
export const selectEmbeddingsFiltered = (state) => state.settings.embeddings.filtered;
export const selectRecommendedEncodersAll = (state) => state.settings.recommendedEncodersAll;
export const selectRecommendedEncodersDict = (state) => state.settings.recommendedEncodersDict;

export const selectLabelingTasksAll = (state) => state.settings.labelingTasks.all;
export const selectAttributesDict = createSelector([selectAttributes], (a): any => a ? arrayToDict(a, 'id') : null);
export const selectLabelingTasksDict = createSelector([selectLabelingTasksAll], (a): any => a ? arrayToDict(a, 'id') : null);
export const selectUsableAttributesFiltered = createSelector([selectUsableAttributes], (a): any => a ? a.filter((attribute) => attribute.id != '@@NO_ATTRIBUTE@@') : null);
export const selectUsableAttributesNoFiltered = createSelector([selectUsableAttributes], (a): any => a ? a.filter((attribute) => (attribute.dataType == DataTypeEnum.TEXT || attribute.id == '@@NO_ATTRIBUTE@@')) : null);
export const selectVisibleAttributesLabeling = createSelector([selectUsableAttributes], (a): any => a ? a.filter((a) => a.visibility == AttributeVisibility.DO_NOT_HIDE || a.visibility == AttributeVisibility.HIDE_ON_DATA_BROWSER) : null);
export const selectVisibleAttributesDataBrowser = createSelector([selectUsableAttributes], (a): any => a ? a.filter((a) => a.visibility == AttributeVisibility.DO_NOT_HIDE) : null);
export const selectVisibleAttributeAC = createSelector([selectUsableAttributesFiltered], (a): any => a ? a.filter((a) => a.visibility != AttributeVisibility.HIDE) : null);
export const selectVisibleAttributesHeuristics = createSelector([selectUsableAttributesFiltered], (a): any => a ? a.filter((a) => a.visibility != AttributeVisibility.HIDE) : null);
export const selectOnAttributeEmbeddings = createSelector([selectEmbeddings], (a): any => a ? a.filter((embedding) => embedding.type == EmbeddingType.ON_ATTRIBUTE && embedding.state == Status.FINISHED) : null);

export const { setAllAttributes, extendAllAttributes, removeFromAllAttributesById, updateAttributeById, setAllEmbeddings, setFilteredEmbeddings, removeFromAllEmbeddingsById, setAllRecommendedEncodersDict, setRecommendedEncodersAll, setLabelingTasksAll, removeFromAllLabelingTasksById, removeLabelFromLabelingTask, setGatesIntegration } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;