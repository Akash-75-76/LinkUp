import { createSlice } from "@reduxjs/toolkit";

import { loginUser, registerUser } from "../../action/authAction/index";

const initialState={
    user:[],
    isError:false,
    isSuccess:false,
    isLoading:false,
    loggedIn:false,
    message:"",
    profileFetched:false,
    connections:[],
    connectionRequests:[],
}

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        reset:()=>initialState,
        handleLoginUser:(state)=>{
            state.message="";
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(loginUser.pending,(state)=>{
            state.isLoading=true;
            state.message="Knocking the door..."
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.isError=false;
            state.isSuccess=true;
            state.loggedIn=true;
            state.message="Welcome back!";
        })
        .addCase(loginUser.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true;
            state.isSuccess=false;
            state.loggedIn=false;
            state.message=action.payload || "Something went wrong";
        })
        .addCase(registerUser.pending,(state)=>{
            state.isLoading=true;
            state.message="Creating your account..."
        })
        .addCase(registerUser.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.isError=false;
            state.isSuccess=true;
            state.loggedIn=true;
            state.message="Account created successfully!";
        })
        .addCase(registerUser.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true;
            state.isSuccess=false;
            state.loggedIn=false;
            state.message=action.payload || "Something went wrong";
        })
    }
});

export default authSlice.reducer;
