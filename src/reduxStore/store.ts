import { safeAccess } from "@/submodules/javascript-functions/general";
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
import { dataBlocksReducer } from './states/pages/data-blocks';

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
        tmp: tmpReducer,
        dataBlocks: dataBlocksReducer,
    },
    devTools: process.env.IS_DEV == '1',
});

export default store;

export function getStoreSnapshotValue(access: string[]): any {
    // access via getState (current snapshot) when we don't need to subscribe to future updates
    const currentState = store.getState();
    let value = currentState;
    for (let i = 0; i < access.length; i++) {
        value = safeAccess(value, access[i]);
    }
    return value;
}