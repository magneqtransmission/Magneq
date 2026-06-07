import {createSlice} from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  route: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload.info;
      state.token = action.payload.token;
      state.route = action.payload.route;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.route = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const selectAuth = (state) => state.auth;
export const {loginUser, logoutUser, updateUser} = authSlice.actions;
export default authSlice.reducer;
