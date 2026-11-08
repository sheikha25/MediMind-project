import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import axios from "axios";

const savedUser =
  localStorage.getItem("medimindUser") ||
  sessionStorage.getItem("medimindUser");

const initialState = {
  user: savedUser
    ? JSON.parse(savedUser)
    : {},
  message: "",
  isLoading: false,
  isSuccess: false,
  isError: false,
};

export const addUser =
  createAsyncThunk(
    "user/addUser",
    async (userData) => {
      try {
        const response =
          await axios.post(
            "http://localhost:3002/register",
            userData
          );

        return response.data.message;
      } catch (error) {
        console.log(
          "Server Error.." + error
        );

        throw error;
      }
    }
  );

export const login =
  createAsyncThunk(
    "user/login",
    async (userData) => {
      try {
        const {
          rememberMe,
          ...credentials
        } = userData;

        const response =
          await axios.post(
            "http://localhost:3002/login",
            credentials
          );

        

        return {
          ...response.data,
          rememberMe,
        };
      } catch (error) {
        console.log(
          "Server Error.." + error
        );

        throw error;
      }
    }
  );

export const UserSlice =
  createSlice({
    name: "user",

    initialState,

    reducers: {
       clearUserMessage: (state) => {
    state.message = "";
    state.isSuccess = false;
    state.isError = false;
  },

      logout: (state) => {
        state.user = {};

        localStorage.removeItem(
          "medimindUser"
        );

        sessionStorage.removeItem(
          "medimindUser"
        );

        state.message = "";
        state.isSuccess = false;
        state.isError = false;
        state.isLoading = false;
      },

      updateUser: (
        state,
        action
      ) => {
        state.user =
          action.payload;

        if (
          localStorage.getItem(
            "medimindUser"
          )
        ) {
          localStorage.setItem(
            "medimindUser",
            JSON.stringify(
              action.payload
            )
          );
        } else {
          sessionStorage.setItem(
            "medimindUser",
            JSON.stringify(
              action.payload
            )
          );
        }
      },
    },

    extraReducers: (
      builder
    ) => {
      builder
        .addCase(
          addUser.pending,
          (state) => {
            state.isLoading =
              true;

            state.isError =
              false;
          }
        )

        .addCase(
          addUser.fulfilled,
          (
            state,
            action
          ) => {
            state.isLoading =
              false;

            state.isSuccess =
              true;

            state.message =
              action.payload;
          }
        )

        .addCase(
          addUser.rejected,
          (state) => {
            state.isLoading =
              false;

            state.isError =
              true;
          }
        )

        .addCase(
          login.pending,
          (state) => {
            state.isLoading =
              true;

            state.isError =
              false;

            state.isSuccess =
              false;
          }
        )

        .addCase(
          login.fulfilled,
          (
            state,
            action
          ) => {
            state.isLoading =
              false;

            state.message =
              action.payload
                ?.message || "";

            if (
              action.payload
                ?.message ===
                "success" &&
              action.payload
                ?.user
            ) {
              state.user =
                action.payload.user;

              if (
                action.payload
                  .rememberMe
              ) {
                localStorage.setItem(
                  "medimindUser",
                  JSON.stringify(
                    action.payload
                      .user
                  )
                );

                sessionStorage.removeItem(
                  "medimindUser"
                );
              } else {
                sessionStorage.setItem(
                  "medimindUser",
                  JSON.stringify(
                    action.payload
                      .user
                  )
                );

                localStorage.removeItem(
                  "medimindUser"
                );
              }

              state.isSuccess =
                true;

              state.isError =
                false;
            } else {
              state.user = {};

              localStorage.removeItem(
                "medimindUser"
              );

              sessionStorage.removeItem(
                "medimindUser"
              );

              state.isSuccess =
                false;

              state.isError =
                true;
            }
          }
        )

        .addCase(
          login.rejected,
          (state) => {
            state.isLoading =
              false;

            state.isSuccess =
              false;

            state.isError =
              true;

            state.user = {};

            localStorage.removeItem(
              "medimindUser"
            );

            sessionStorage.removeItem(
              "medimindUser"
            );
          }
        );
    },
  });

export const {
  logout,
  updateUser,
  clearUserMessage,
} = UserSlice.actions;

export default UserSlice.reducer;
