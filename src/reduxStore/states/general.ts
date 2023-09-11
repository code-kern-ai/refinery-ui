import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    mail: string;
    role: string;
    avatarUri: string;
}

export type Organization = {
    gdprCompliant: boolean;
    id: string;
    name: string;
    maxCharCount: boolean;
    maxCols: boolean;
    maxRows: boolean;
}

const initialState = {
    data: {
        user: null,
        currentPage: '',
        isManaged: true,
        isDemo: false,
        organization: null
    }
} as {
    data: {
        user: User;
        currentPage: string;
        isManaged: boolean;
        isDemo: boolean;
        organization: Organization;
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
        },
        setIsManaged(state, action: PayloadAction<boolean>) {
            state.data.isManaged = action.payload;
        },
        setIsDemo(state, action: PayloadAction<boolean>) {
            state.data.isDemo = action.payload;
        },
        setOrganization(state, action: PayloadAction<Organization>) {
            if (action.payload) state.data.organization = { ...action.payload };
            else state.data.organization = null;
        }
    },
})


//selectors
export const selectUser = (state) => state.general.data.user;
export const selectCurrentPage = (state) => state.general.data.currentPage;
export const selectIsManaged = (state) => state.general.data.isManaged;
export const selectIsDemo = (state) => state.general.data.isDemo;
export const selectOrganization = (state) => state.general.data.organization;


export const { setUser, setCurrentPage, setIsManaged, setIsDemo, setOrganization } = generalSlice.actions;
export const generalReducer = generalSlice.reducer;