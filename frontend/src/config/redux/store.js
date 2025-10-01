import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authreducer";
export const store=configureStore({
    reducer:{
        auth:authReducer
    }
})