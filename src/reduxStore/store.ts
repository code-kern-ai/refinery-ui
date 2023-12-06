import { configureStore } from '@reduxjs/toolkit';
import { generalReducer } from './states/general';
import { projectReducer } from './states/project';
import { lookupListsReducer } from './states/pages/lookup-lists';
import { modalReducer } from './states/modal';
import { uploadReducer } from './states/upload';
import { settingsReducer } from './states/pages/settings';
import { modelsDownloadedReducer } from './states/pages/models-downloaded';
import { heuristicsReducer } from './states/pages/heuristics';
import { dataBrowserReducer } from './states/pages/data-browser';
import { cacheReducer } from './states/cachedValues';
import { labelingReducer } from './states/pages/labeling';
import { tmpReducer } from './states/tmp';

const store = configureStore({
    reducer: {
        general: generalReducer,
        projects: projectReducer,
        modals: modalReducer,
        lookupLists: lookupListsReducer,
        upload: uploadReducer,
        settings: settingsReducer,
        modelsDownloaded: modelsDownloadedReducer,
        heuristics: heuristicsReducer,
        dataBrowser: dataBrowserReducer,
        cache: cacheReducer,
        labeling: labelingReducer,
        tmp: tmpReducer
    },
    devTools: process.env.IS_DEV == '1',
});

export default store;
