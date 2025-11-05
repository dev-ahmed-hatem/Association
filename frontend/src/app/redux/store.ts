import {
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";
import api from "../api/apiSlice";
import authReducer from "@/app/slices/authSlice";

const store = configureStore({
  reducer: {
    // api reducer
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    // api middleware
    getDefaultMiddleware({
      // Ignore non-serializable checks for RTK Query actions (excel sheets responses)
      serializableCheck: {
        ignoredActions: [
          "api/executeQuery/fulfilled",
          "api/executeQuery/rejected",
          "api/executeQuery/pending",
        ],
      },
    }).concat(api.middleware),
});

export default store;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useDispatch = () => store.dispatch;

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
