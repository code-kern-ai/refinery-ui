import { configureStore } from '@reduxjs/toolkit';
import { generalReducer } from './states/general';
import { projectReducer } from './states/project';
import { lookupListsReducer } from './states/pages/lookup-lists';

const store = configureStore({
    reducer: {
        general: generalReducer,
        projects: projectReducer,
        lookupLists: lookupListsReducer
    },
});

export default store;
