import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authreducer";
import postReducer from "./reducer/postReducer"
import chatReducer from "./reducer/chatReducer";
export const store=configureStore({
    reducer:{
        auth:authReducer,
        posts:postReducer,
        chat:chatReducer,
    },
});