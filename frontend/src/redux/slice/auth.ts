import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API } from "@/utils/api";
import { toastSuccess } from "@/utils/toast";

export const loginAsync = createAsyncThunk(
  "login",
  async (body: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await API.post("login", body);
      const token = response.data.token;

      localStorage.setItem("token", token);

      toastSuccess(response.data.message);

      return token;
    } catch (error) {
      const err = error as unknown as Error;

      thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const authCheckAsync = createAsyncThunk(
  "check",
  async (token: string, thunkAPI) => {
    try {
      await API.get("check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return token as string;
    } catch (error) {
      localStorage.removeItem("token");

      const err = error as unknown as Error;
      thunkAPI.rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLogin: false,
    token: "",
  },
  reducers: {
    LOGOUT: (state) => {
      state.isLogin = false;
      state.token = "";
    },
  },
  extraReducers(builder) {
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      state.isLogin = true;
      state.token = action.payload;
    });
    builder.addCase(authCheckAsync.fulfilled, (state, action) => {
      state.isLogin = true;
      state.token = action.payload!;
    });
  },
});

export const { LOGOUT } = authSlice.actions;
export default authSlice.reducer;
