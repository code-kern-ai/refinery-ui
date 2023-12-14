import { Attribute } from "@/src/types/components/projects/projectId/settings/data-schema";
import { BricksIntegratorConfig } from "@/src/types/shared/bricks-integrator";
import { CommentData, CommentDataStore, CommentPosition } from "@/src/types/shared/comments";
import { User } from "@/src/types/shared/general";
import { NotificationListWrapper } from "@/src/types/shared/notification-center";
import { UserRole } from "@/src/types/shared/sidebar";
import { arrayToDict } from "@/submodules/javascript-functions/general";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";

export type Organization = {
    gdprCompliant: boolean;
    id: string;
    name: string;
    maxCharCount: boolean;
    maxCols: boolean;
    maxRows: boolean;
}

const initialState = {
    user: null,
    currentPage: '',
    isManaged: true,
    isDemo: false,
    isAdmin: false,
    organization: null,
    organizationInactive: null,
    users: {
        all: [],
        engineers: [],
        annotators: [],
        experts: [],
    },
    notifications: [],
    comments: {
        all: [],
    },
    bricksIntegrator: {
        config: null,
        attributes: []
    }
} as {
    user: User;
    currentPage: string;
    isManaged: boolean;
    isDemo: boolean;
    isAdmin: boolean;
    organization: Organization;
    organizationInactive: boolean;
    users: {
        all: User[];
        engineers: User[];
        annotators: User[];
        experts: User[];
    },
    notifications: NotificationListWrapper[];
    comments: {
        all: CommentData[];
    },
    bricksIntegrator: {
        config: BricksIntegratorConfig;
        attributes: Attribute[]
    }
}

const generalSlice = createSlice({
    name: 'general',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            if (action.payload) state.user = { ...action.payload };
            else state.user = null;
        },
        setCurrentPage(state, action: PayloadAction<string>) {
            state.currentPage = action.payload;
        },
        setIsManaged(state, action: PayloadAction<boolean>) {
            state.isManaged = action.payload;
        },
        setIsDemo(state, action: PayloadAction<boolean>) {
            state.isDemo = action.payload;
        },
        setIsAdmin(state, action: PayloadAction<boolean>) {
            state.isAdmin = action.payload;
        },
        setOrganization(state, action: PayloadAction<Organization>) {
            if (action.payload) state.organization = { ...action.payload };
            else state.organization = null;
            state.organizationInactive = action.payload == null;
        },
        setAllUsers(state, action: PayloadAction<User[]>) {
            if (action.payload) state.users.all = [...action.payload];
            else state.users.all = [];
            state.users.engineers = state.users.all.filter(user => user.role == UserRole.ENGINEER);
            state.users.annotators = state.users.all.filter(user => user.role == UserRole.ANNOTATOR);
            state.users.experts = state.users.all.filter(user => user.role == UserRole.EXPERT);
        },
        setNotifications(state, action: PayloadAction<NotificationListWrapper[]>) {
            if (action.payload) state.notifications = [...action.payload];
            else state.notifications = [];
        },
        setComments: (state, action: PayloadAction<CommentData[]>) => {
            if (action.payload) state.comments.all = action.payload;
            else state.comments.all = null;
        },
        setBricksIntegrator(state, action: PayloadAction<BricksIntegratorConfig>) {
            if (action.payload) state.bricksIntegrator.config = action.payload;
            else state.bricksIntegrator.config = null;
        },
        setAttributesBricksIntegrator(state, action: PayloadAction<any[]>) {
            if (action.payload) state.bricksIntegrator.attributes = action.payload;
            else state.bricksIntegrator.attributes = [];
        }
    },
})


//selectors
export const selectUser = (state) => state.general.user;
export const selectCurrentPage = (state) => state.general.currentPage;
export const selectIsManaged = (state) => state.general.isManaged;
export const selectIsDemo = (state) => state.general.isDemo;
export const selectIsAdmin = (state) => state.general.isAdmin;
export const selectOrganization = (state) => state.general.organization;
export const selectInactiveOrganization = (state) => state.general.organizationInactive;
export const selectAllUsers = (state) => state.general.users.all;
export const selectEngineers = (state) => state.general.users.engineers;
export const selectAnnotators = (state) => state.general.users.annotators;
export const selectExperts = (state) => state.general.users.experts;
export const selectNotifications = (state) => state.general.notifications;
export const selectComments = (state) => state.general.comments.all;
export const selectBricksIntegrator = (state) => state.general.bricksIntegrator.config;
export const selectBricksIntegratorAttributes = (state) => state.general.bricksIntegrator.attributes;

export const selectAnnotatorsDict = createSelector([selectAnnotators], (a): any => a ? arrayToDict(a, 'id') : null);

export const { setUser, setCurrentPage, setIsManaged, setIsDemo, setIsAdmin, setOrganization, setAllUsers, setNotifications, setComments, setBricksIntegrator, setAttributesBricksIntegrator } = generalSlice.actions;
export const generalReducer = generalSlice.reducer;