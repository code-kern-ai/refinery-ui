import { ModalEnum } from '@/src/types/shared/modal';
import { createSlice } from '@reduxjs/toolkit'
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
        open: false,
    },
    [ModalEnum.PROJECT_SNAPSHOT]: {
        open: false,
    },
    [ModalEnum.GATES_INTEGRATION_WARNING]: {
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

// higher order selector (function that creates a function)
export function selectModal(modalName: ModalEnum) {
    return (state) => state.modals[modalName];
}