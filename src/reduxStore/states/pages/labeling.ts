import { postProcessRla, postProcessTokenizedRecords } from "@/src/util/components/projects/projectId/labeling/labeling-general-helper";
import { postProcessRecordByRecordId } from "@/src/util/components/projects/projectId/settings/attribute-calculation-helper";
import { arrayToDict, transferNestedDict } from "@/submodules/javascript-functions/general";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { Record } from "@/src/types/components/projects/projectId/settings/attribute-calculation";
import { LabelingSuiteManager } from "@/src/util/classes/labeling/manager";
import { RecordManager } from "@/src/util/classes/labeling/record-manager";
import { ComponentType, LabelingSuiteSettings } from "@/src/types/components/projects/projectId/labeling/settings";
import { SettingManager } from "@/src/util/classes/labeling/settings-manager";


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
    },
    settings: LabelingSuiteSettings;
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
        },
        settings: SettingManager.getDefaultLabelingSuiteSettings(),
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
        },
        setSettings(state, action: PayloadAction<any>) {
            if (action.payload) {
                state.settings = action.payload;
            }
            else state.settings = null;
        },
        updateSettings: {
            reducer(state, action: PayloadAction<any[]>) {
                if (action.payload.length !== 3) throw new Error("updateSettings must be called with exactly 3 arguments");
                let [componentType, settingsPath, value] = action.payload;
                let settings;
                switch (componentType) {
                    case ComponentType.MAIN:
                        settings = state.settings.main;
                        break;
                    case ComponentType.OVERVIEW_TABLE:
                        settings = state.settings.overviewTable;
                        break;
                    case ComponentType.LABELING:
                        settings = state.settings.labeling;
                        break;
                    case ComponentType.TASK_HEADER:
                        settings = state.settings.task;
                        break;
                }
                if (!settings) return;
                const keyParts = settingsPath.split('.');
                const lastKey = keyParts.pop();
                for (const key of keyParts) {
                    if (!settings[key]) return;
                    settings = settings[key];
                }

                const currentValue = settings[lastKey];
                if (currentValue != value) {
                    if (value === undefined) {
                        if (typeof currentValue === "boolean") value = !currentValue;
                        else throw Error("something isn't right")
                    }
                    settings[lastKey] = value;
                }

                if (componentType == ComponentType.MAIN) {
                    const color = state.settings.main.hoverGroupBackgroundColor;
                    if (color == "None") state.settings.main.hoverGroupBackgroundColorClass = "";
                    else if (color == "light gray") state.settings.main.hoverGroupBackgroundColorClass = "bg-gray-100";
                    else if (color == "gray") state.settings.main.hoverGroupBackgroundColorClass = "bg-gray-200";
                    else state.settings.main.hoverGroupBackgroundColorClass = "bg-" + color + "-200";
                }
            },
            prepare(componentType: ComponentType, settingsPath: string, value?: any) {
                return {
                    payload: [componentType, settingsPath, value]
                };
            },
        },
        removeFromRlaById(state, action) {
            const rlaId = action.payload;
            if (rlaId) {
                const index = state.recordRequests.rla.findIndex(rla => rla.id == rlaId);
                if (index != -1) state.recordRequests.rla.splice(index, 1);
            }
        }
    },
});

// selectors
export const selectAvailableLinks = (state: any) => state.labeling.availableLinks;
export const selectAvailableLinksDict = createSelector([selectAvailableLinks], (a): any => a ? arrayToDict(a, 'id') : null);
export const selectSelectedLink = (state: any) => state.labeling.selectedLink;
export const selectRecordRequests = (state: any) => state.labeling.recordRequests;
export const selectRecordRequestsToken = (state: any) => state.labeling.recordRequests.token;
export const selectRecordRequestsRecord = (state: any) => state.labeling.recordRequests.record;
export const selectRecordRequestsRla = (state: any) => state.labeling.recordRequests.rla;
export const selectUserIconsData = (state: any) => state.labeling.userIconsData;
export const selectSettings = (state: any) => state.labeling.settings;

export const { setAvailableLinks, setSelectedLink, updateRecordRequests, updateUsers, setSettings, updateSettings, removeFromRlaById } = labelingSlice.actions;

export const labelingReducer = labelingSlice.reducer;

