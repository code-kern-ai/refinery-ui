import { configureStore } from '@reduxjs/toolkit';
import { generalReducer } from './states/general';
import { projectReducer } from './states/project';
import { lookupListsReducer } from './states/pages/lookup-lists';
import { modalReducer } from './states/modal';
import { uploadReducer } from './states/upload';
import { settingsReducer } from './states/pages/settings';

const store = configureStore({
    reducer: {
        general: generalReducer,
        projects: projectReducer,
        modals: modalReducer,
        lookupLists: lookupListsReducer,
        upload: uploadReducer,
        settings: settingsReducer,
    },
});

export default store;
