import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import chatSlice from './chatSlice';
import postSlice from "./postSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    chat: chatSlice,
    posts: postSlice,
  },
});

export default store;
