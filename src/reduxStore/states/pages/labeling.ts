import { postProcessRla, postProcessTokenizedRecords } from "@/src/util/components/projects/projectId/labeling/labeling-general-helper";
import { postProcessRecordByRecordId } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import { arrayToDict } from "@/submodules/javascript-functions/general";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { Record } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { RecordManager } from "@/src/util/classes/labeling/record-manager";


type LabelingSuiteState = {
    links: {
        availableLinks: any[];
        selectedLink: any;
    }
    recordRequests: {
        token: any[];
        record: Record;
        rla: any;
    },
    userIconsData: {
        userIcons: any[];
        showUserIcons: boolean;
    }
}

function getInitState(): LabelingSuiteState {
    return {
        links: {
            availableLinks: [],
            selectedLink: null,
        },
        recordRequests: {
            token: [],
            record: null,
            rla: null,
        },
        userIconsData: {
            userIcons: [],
            showUserIcons: false,
        }
    };
}

const initialState = getInitState();

const labelingSlice = createSlice({
    name: 'labeling',
    initialState,
    reducers: {
        setAvailableLinks(state, action) {
            if (action.payload) state.links.availableLinks = action.payload;
            else state.links.availableLinks = [];
        },
        setSelectedLink(state, action) {
            if (action.payload) state.links.selectedLink = action.payload;
            else state.links.selectedLink = [];
        },
        updateRecordRequests: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateRecordRequests must be called with exactly 2 arguments");
                const [field, data] = action.payload;
                if (action.payload) {
                    switch (field) {
                        case 'token':
                            state.recordRequests.token = postProcessTokenizedRecords(data);
                            break;
                        case 'record':
                            state.recordRequests.record = postProcessRecordByRecordId(data);
                            break;
                        case 'rla':
                            state.recordRequests.rla = postProcessRla(data);
                            if (RecordManager.ignoreRlas(state.recordRequests.rla)) return;
                            LabelingSuiteManager.somethingLoading = false;
                            break;
                    }
                } else {
                    state.recordRequests = {
                        token: [],
                        record: null,
                        rla: null,
                    }
                }
            },
            prepare(field: string, data: any) {
                return {
                    payload: [field, data]
                };
            },
        },
        updateUsers: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 2) throw new Error("updateUsers must be called with exactly 2 arguments");
                const [field, data] = action.payload;
                if (action.payload) state.userIconsData[field] = data;
                else state.userIconsData = {
                    userIcons: [],
                    showUserIcons: false,
                }
            },
            prepare(field: string, data: any) {
                return {
                    payload: [field, data]
                };
            },
        }
    },
});

// selectors
export const selectAvailableLinks = (state: any) => state.labeling.availableLinks;
export const selectAvailableLinksDict = createSelector([selectAvailableLinks], (a): any => a ? arrayToDict(a, 'id') : null);
export const selectSelectedLink = (state: any) => state.labeling.selectedLink;
export const selectRecordRequests = (state: any) => state.labeling.recordRequests;
export const selectRecordRequestsToken = createSelector([selectRecordRequests], (a): any => a ? a.token : null);
export const selectRecordRequestsRecord = createSelector([selectRecordRequests], (a): any => a ? a.record : null);
export const selectRecordRequestsRla = createSelector([selectRecordRequests], (a): any => a ? a.rla : null);
export const selectUserIconsData = (state: any) => state.labeling.userIconsData;

export const { setAvailableLinks, setSelectedLink, updateRecordRequests, updateUsers } = labelingSlice.actions;

export const labelingReducer = labelingSlice.reducer;