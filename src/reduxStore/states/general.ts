import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    mail: string;
    role: string;
    avatarUri: string;
}

const initialState = {
    data: {
        user: null,
        currentPage: ''
    }
} as {
    data: {
        user: User;
        currentPage: string;
    }
}

const generalSlice = createSlice({
    name: 'general',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            if (action.payload) state.data.user = { ...action.payload };
            else state.data.user = null;
        },
        setCurrentPage(state, action: PayloadAction<string>) {
            state.data.currentPage = action.payload;
        }
    },
})


//selectors
export const selectUser = (state) => state.general.data.user;
export const selectCurrentPage = (state) => state.general.data.currentPage;


export const { setUser, setCurrentPage } = generalSlice.actions;
export const generalReducer = generalSlice.reducer;