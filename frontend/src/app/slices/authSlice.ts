import { User } from "@/types/user";
import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  permissions: string[];
}

const initialState: AuthState = {
  user: null,
  permissions: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state, action) {
      state.user = null;
    },
    setPermissions(state, action) {
      state.permissions = action.payload;
    },
  },
});

export const { setUser, clearUser, setPermissions } = authSlice.actions;
export default authSlice.reducer;
