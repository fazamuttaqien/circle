// What is redux?
// redux is a package that helps distribute calls throughout our application

// An example is a loudspeaker which functions to convey information globally,
// so everyone in the application can receive the information without having to be in the same room
import { PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

// this payload action is a type of Redux toolkit which by default carries a payload.
// createAsyncThunk has the same function as async, calling data asynchronously in API calls.

import { createSlice } from "@reduxjs/toolkit";
// this is to create a slice in redux. Its function is to divide code so that it is easy to manage.

import { API } from "@/utils/api";
import getError from "@/utils/getError";

type initialStateT = {
  data: UserProfileType | null;
  isLoading: boolean;
  isError: boolean;
  error: string;
};

const initialState: initialStateT = {
  data: null,
  isLoading: false,
  isError: false,
  error: "",
};

const token = localStorage.getItem("token");

export const getDetailUser = createAsyncThunk(
  "detailUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await API.get("users/" + userId, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue({ errorMessage: getError(error) });
    }
  }
);

// async getDetailUser using createAsyncThunk.
// this makes an API call to get user details based on user id
// which are given. If successful, it returns the user data. If an error occurs,
// it rejects with a value indicating an error message.

const detailUserSlice = createSlice({
  name: "detailUser",
  initialState,
  reducers: {}, // this not filled in because it uses extraReducers
  extraReducers: (builder) => {
    builder.addCase(getDetailUser.pending, (state) => {
      state.isLoading = true;
      // data is being processed from our API set to true
    });
    builder.addCase(
      getDetailUser.fulfilled,
      // API data call is successful and the data is retrieved
      (state, action: PayloadAction<UserProfileType>) => {
        state.data = action.payload;
        state.isLoading = false;
        state.isError = false;
        state.error = "";
      }
    );
    builder.addCase(
      getDetailUser.rejected,
      // the data failed to be retrieved, then the error data is also retrieved
      (state, action: PayloadAction<any>) => {
        state.data = null;
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload?.errorMessage || "Unknown Error Occured";
      }
    );
  },
});

export default detailUserSlice.reducer;
