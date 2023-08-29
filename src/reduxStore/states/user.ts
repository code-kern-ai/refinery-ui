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
    data: null
} as { data: User }

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            if (action.payload) state.data = { ...action.payload };
            else state.data = null;
        },
    },
})


//selectors
export const selectUser = (state) => state.user.data;



export const { setUser } = userSlice.actions;
export const userReducer = userSlice.reducer;