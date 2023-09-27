import { User } from "@/src/types/shared/general";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

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
        isAdmin: false,
        organization: null,
        organizationInactive: null,
    }
} as {
    data: {
        user: User;
        currentPage: string;
        isManaged: boolean;
        isDemo: boolean;
        isAdmin: boolean;
        organization: Organization;
        organizationInactive: boolean;
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
        setIsAdmin(state, action: PayloadAction<boolean>) {
            state.data.isAdmin = action.payload;
        },
        setOrganization(state, action: PayloadAction<Organization>) {
            if (action.payload) state.data.organization = { ...action.payload };
            else state.data.organization = null;
            state.data.organizationInactive = action.payload == null;
        }
    },
})


//selectors
export const selectUser = (state) => state.general.data.user;
export const selectCurrentPage = (state) => state.general.data.currentPage;
export const selectIsManaged = (state) => state.general.data.isManaged;
export const selectIsDemo = (state) => state.general.data.isDemo;
export const selectIsAdmin = (state) => state.general.data.isAdmin;
export const selectOrganization = (state) => state.general.data.organization;
export const selectInactiveOrganization = (state) => state.general.data.organizationInactive;


export const { setUser, setCurrentPage, setIsManaged, setIsDemo, setIsAdmin, setOrganization } = generalSlice.actions;
export const generalReducer = generalSlice.reducer;