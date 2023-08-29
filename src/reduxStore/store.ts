import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './states/user';
import { projectReducer } from './states/project';

const store = configureStore({
    reducer: {
        user: userReducer,
        projects: projectReducer,
    },
});

export default store;
