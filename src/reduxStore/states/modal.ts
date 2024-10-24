import { ModalEnum } from '@/src/types/shared/modal';
import { Modal } from '@nextui-org/react';
import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// only values that need to be accessed from outside the modal
// normal state management (e.g. input fields) should be handled inside the modal/react states
export type Modal = {
    open: boolean;
    [attribute: string]: any; //for sub components in modals
}

export type Modals = {
    [modalName in ModalEnum]: Modal;
};

export type ModalChangeHelper = {
    modalName: string;
    key: string;
    value: any;
}

const initialState: Modals = {
    [ModalEnum.DELETE_LOOKUP_LIST]: {
        open: false,
    },
    [ModalEnum.ADMIN_DELETE_PROJECT]: {
        open: false,
        projectId: '',
    },
    [ModalEnum.MODAL_UPLOAD]: {
        open: false,
    },
    [ModalEnum.SAMPLE_PROJECT_TITLE]: {
        open: false,
    },
    [ModalEnum.VERSION_OVERVIEW]: {
        open: false,
    },
    [ModalEnum.HOW_TO_UPDATE]: {
        open: false,
    },
    [ModalEnum.CREATE_NEW_ATTRIBUTE]: {
        open: false
    },
    [ModalEnum.PROJECT_SNAPSHOT]: {
        open: false,
    },
    [ModalEnum.FILTERED_ATTRIBUTES]: {
        open: false,
        embeddingId: '',
        attributeNames: [],
        showEditOption: false
    },
    [ModalEnum.DELETE_EMBEDDING]: {
        open: false,
        embeddingId: '',
        isQueuedElement: false,
    },
    [ModalEnum.ADD_EMBEDDING]: {
        open: false
    },
    [ModalEnum.DELETE_MODEL_DOWNLOAD]: {
        open: false,
        modelName: '',
    },
    [ModalEnum.ADD_MODEL_DOWNLOAD]: {
        open: false,
    },
    [ModalEnum.DELETE_LABELING_TASK]: {
        open: false,
        taskId: '',
    },
    [ModalEnum.ADD_LABELING_TASK]: {
        open: false,
    },
    [ModalEnum.ADD_LABEL]: {
        open: false,
        taskId: '',
    },
    [ModalEnum.DELETE_LABEL]: {
        open: false,
        taskId: '',
        label: {}
    },
    [ModalEnum.CHANGE_COLOR]: {
        open: false,
        taskId: '',
        label: {}
    },
    [ModalEnum.RENAME_LABEL]: {
        open: false,
        label: {},
        taskId: '',
        changedLabelName: ''
    },
    [ModalEnum.EXECUTE_ATTRIBUTE_CALCULATION]: {
        open: false,
        requestedSomething: false,
    },
    [ModalEnum.DELETE_ELEMENT]: {
        open: false,
        id: '',
    },
    [ModalEnum.VIEW_RECORD_DETAILS]: {
        open: false,
        record: '',
        recordIdx: 0,
    },
    [ModalEnum.PASTE_LOOKUP_LIST]: {
        open: false
    },
    [ModalEnum.REMOVE_LOOKUP_LIST]: {
        open: false
    },
    [ModalEnum.DELETE_HEURISTICS]: {
        open: false
    },
    [ModalEnum.ADD_LABELING_FUNCTION]: {
        open: false
    },
    [ModalEnum.ADD_ACTIVE_LEARNER]: {
        open: false
    },
    [ModalEnum.LAST_WEAK_SUPERVISION_RUN]: {
        open: false
    },
    [ModalEnum.SAMPLE_RECORDS_LABELING_FUNCTION]: {
        open: false,
        currentRecordIdx: -1,
    },
    [ModalEnum.DATA_SLICE_INFO]: {
        open: false,
        sliceInfo: null,
    },
    [ModalEnum.DELETE_SLICE]: {
        open: false,
        sliceId: '',
    },
    [ModalEnum.SAVE_DATA_SLICE]: {
        open: false,
        sliceName: '',
    },
    [ModalEnum.CONFIGURATION]: {
        open: false
    },
    [ModalEnum.RECORD_COMMENTS]: {
        open: false,
        commentsData: null,
    },
    [ModalEnum.SIMILARITY_SEARCH]: {
        open: false,
        recordId: '',
    },
    [ModalEnum.CREATE_OUTLIER_SLICE]: {
        open: false,
        embeddingId: '',
    },
    [ModalEnum.DELETE_RECORD]: {
        open: false,
    },
    [ModalEnum.LABELING_SETTINGS]: {
        open: false,
    },
    [ModalEnum.LABELING_INFO_TABLE]: {
        open: false,
    },
    [ModalEnum.INFO_LABEL_BOX]: {
        open: false,
        labelSettingsLabel: null,
    },
    [ModalEnum.SYNC_RECORDS]: {
        open: false,
        syncModalAmount: 0,
    },
    [ModalEnum.EXPLAIN_EDIT_RECORDS]: {
        open: false,
    },
    [ModalEnum.NEW_PERSONAL_TOKEN]: {
        open: false,
    },
    [ModalEnum.DELETE_PERSONAL_TOKEN]: {
        open: false,
        tokenId: ''
    },
    [ModalEnum.NOTIFICATION_CENTER]: {
        open: false,
    },
    [ModalEnum.EXPORT_RECORDS]: {
        open: false,
    },
    [ModalEnum.BRICKS_INTEGRATOR]: {
        open: false
    },
    [ModalEnum.SIZE_WARNING]: {
        open: false
    }
};

const modalSlice = createSlice({
    name: 'modals',
    initialState,
    reducers: {
        setModalStates: {
            reducer(state, action: PayloadAction<any[]>) {
                const [modal, changes] = action.payload;
                for (const key in changes) state[modal][key] = changes[key];
            },
            prepare(modal: ModalEnum, changes: { [attribute: string]: any }) {
                return {
                    payload: [modal, changes]
                };
            },
        },
        openModal(state, action: PayloadAction<ModalEnum>) {
            state[action.payload].open = true;
        },
        closeModal(state, action: PayloadAction<ModalEnum>) {
            state[action.payload].open = false;
        },
        initModal(state, action: PayloadAction<ModalEnum>) {
            state[action.payload] = initialState[action.payload];
        },
    },
})

export const { setModalStates, openModal, closeModal, initModal } = modalSlice.actions;
export const modalReducer = modalSlice.reducer;

//selectors
export const selectModals = (state) => state.modals;
export const selectModalsValues = createSelector([selectModals], (a): any => a ? Object.values(a) : null)
export const selectAllOpenModals = createSelector([selectModalsValues], (a): any => a ? a.filter(o => o.open) : null)


// higher order selector (function that creates a function)
export function selectModal(modalName: ModalEnum) {
    return (state) => state.modals[modalName];
}