import { API } from "@/utils/api";
import getError from "@/utils/getError";
import { PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

type initialStateT = {
  data: UserProfileType | null;
  isLoading: boolean;
  isError: boolean;
  error: string;
};

const initialState: initialStateT = {
  data: null,
  isLoading: true,
  isError: false,
  error: "",
};

// interface JWTPayload {
//   id: string;
// }

const token = localStorage.getItem("token");
// if (!token) {
//   throw new Error("JWT token not found in localStorage.");
// }
// const decodedToken = token.split(".")[1];
// const userData = JSON.parse(atob(decodedToken));
// const idUser = userData?.User?.id;

export const getProfile = createAsyncThunk(
  "profile",
  async (_, { rejectWithValue }) => {
    const getToken = () => {
      if (token) {
        const decodedToken = token.split(".")[1];
        const userData = JSON.parse(atob(decodedToken));
        const idUser = userData?.User?.id;

        return idUser;
      } else {
        return null;
      }
    };

    try {
      const id = getToken();
      const response = await API.get(`users/${id}`, {
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

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {}, // not filled in because it uses extraReducers
  extraReducers: async (builder) => {
    builder.addCase(getProfile.pending, (state) => {
      state.isLoading = true;
      // the data is being processed from our API set to true
    });
    builder.addCase(
      getProfile.fulfilled,
      // the API data call was successful and the data was retrieved
      (state, action: PayloadAction<UserProfileType>) => {
        state.data = action.payload;
        state.isLoading = false;
        state.isError = false;
        state.error = "";
      }
    );
    builder.addCase(
      getProfile.rejected,
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

export default profileSlice.reducer;
