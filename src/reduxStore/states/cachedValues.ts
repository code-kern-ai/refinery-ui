import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export enum CacheEnum {
    MODELS_LIST = 'MODELS_LIST',
    TOKENIZER_VALUES = 'TOKENIZER_VALUES',
    VERSION_OVERVIEW = 'VERSION_OVERVIEW',
    EMBEDDING_PLATFORMS = 'EMBEDDING_PLATFORMS',
}

export type CachedVales = {
    [cacheValue in CacheEnum]: { [key: string]: any };
};

const initialState: CachedVales = {
    [CacheEnum.MODELS_LIST]: null,
    [CacheEnum.TOKENIZER_VALUES]: null,
    [CacheEnum.VERSION_OVERVIEW]: null,
    [CacheEnum.EMBEDDING_PLATFORMS]: null,
};

const cacheSlice = createSlice({
    name: 'cache',
    initialState,
    reducers: {
        setCache: {
            reducer(state, action: PayloadAction<any[]>) {
                const [cache, value] = action.payload;
                state[cache] = value;
            },
            prepare(cache: CacheEnum, value: any) {
                return { payload: [cache, value] };
            },
        },
        initCache(state, action: PayloadAction<CacheEnum>) {
            state[action.payload] = initialState[action.payload];
        },
    },
})

export const { setCache, initCache } = cacheSlice.actions;
export const cacheReducer = cacheSlice.reducer;

//selectors


// higher order selector (function that creates a function)
export function selectCachedValue(cache: CacheEnum) {
    return (state) => state.cache[cache];
}