import { arrayToDict } from "@/submodules/javascript-functions/general";
import { createSelector, createSlice } from "@reduxjs/toolkit";

type LabelingSuiteState = {
    links: {
        availableLinks: any[];
        selectedLink: any;
    }
}

function getInitState(): LabelingSuiteState {
    return {
        links: {
            availableLinks: [],
            selectedLink: null,
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
        }
    },
});

// selectors
export const selectAvailableLinks = (state: any) => state.labeling.availableLinks;
export const selectAvailableLinksDict = createSelector([selectAvailableLinks], (a): any => a ? arrayToDict(a, 'id') : null);
export const selectSelectedLink = (state: any) => state.labeling.selectedLink;

export const { setAvailableLinks, setSelectedLink } = labelingSlice.actions;

export const labelingReducer = labelingSlice.reducer;