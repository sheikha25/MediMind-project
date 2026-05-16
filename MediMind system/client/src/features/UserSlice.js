import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  user: {},
  message: "",
  isLoading: false,
  isSuccess: false,
  isError: false
};

export const addUser = createAsyncThunk("user/addUser", async (userData) => {
  try {
    const response = await axios.post("http://localhost:3002/register", userData);
    return response.data.message;
  } catch (error) {
    console.log("Server Error.." + error);
  }
});

export const login = createAsyncThunk("user/login", async (userData) => {
  try {
    const response = await axios.post("http://localhost:3002/login", userData);
    return response.data;
  } catch (error) {
    console.log("Server Error.." + error);
  }
});

export const UserSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = {};
      state.message = "";
      state.isSuccess = false;
      state.isError = false;
      state.isLoading = false;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(addUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload;
      })
      .addCase(addUser.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  }
});

export const { logout } = UserSlice.actions;
export default UserSlice.reducer;