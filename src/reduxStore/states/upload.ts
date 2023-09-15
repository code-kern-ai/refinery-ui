import { UploadFileType, UploadTask } from "@/src/types/shared/upload";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type UploadState = {
    uploadFileType: UploadFileType;
    uploadTask: UploadTask | null;
    importOptions: string;
}

function getInitState(): UploadState {
    return {
        uploadFileType: null,
        uploadTask: null,
        importOptions: null,
    };
}

const initialState = getInitState();

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        setUploadFileType(state, action) {
            state.uploadFileType = action.payload;
        },
        setUploadTask(state, action: PayloadAction<UploadTask>) {
            if (action.payload) state.uploadTask = action.payload;
            else state.uploadTask = null;
        },
        setImportOptions(state, action: PayloadAction<string>) {
            state.importOptions = action.payload;
        }
    },
});

export const selectUploadData = (state) => state.upload;

export const { setUploadFileType, setUploadTask, setImportOptions } = uploadSlice.actions;

export const uploadReducer = uploadSlice.reducer;
