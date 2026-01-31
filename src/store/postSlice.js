import { createSlice } from "@reduxjs/toolkit";

const loadFromCache = () => {
    try {
        const serialized = localStorage.getItem("posts_cache");
        return serialized ? JSON.parse(serialized) : {};
    } catch (e) {
        return {};
    }
};

const postSlice = createSlice({
    name: "posts",
    initialState: {
        cache: loadFromCache(), 
    },
    reducers: {
        cachePost: (state, action) => {
            const { slug, data } = action.payload;
            state.cache[slug] = data;
            
            const keys = Object.keys(state.cache);
            if (keys.length > 20) {
                delete state.cache[keys[0]];
            }

            // Update LocalStorage
            localStorage.setItem("posts_cache", JSON.stringify(state.cache));
        }
    }
});

export const { cachePost } = postSlice.actions;
export default postSlice.reducer;