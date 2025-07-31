// File: src/redux/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { register, login, logout as logoutUser, getUserProfile } from '../api/userApi';

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  status: 'idle',
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const data = await login(userData);
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const registerThunk = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await register(userData);
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchUserProfileThunk = createAsyncThunk('auth/fetchProfile', async (_, { getState, rejectWithValue }) => {
  try {
    const { userInfo } = getState().auth;
    const data = await getUserProfile(userInfo.token);
    // Return the fetched profile data along with the existing token
    return { ...userInfo, ...data };
  } catch (error) {
    return rejectWithValue(error.message);
    }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      logoutUser();
      state.userInfo = null;
      state.status = 'idle';
      state.error = null;
    },
    updateUserInfo: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(registerThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserProfileThunk.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      });
  },
});

export const { logout, updateUserInfo } = authSlice.actions;

export default authSlice.reducer;
