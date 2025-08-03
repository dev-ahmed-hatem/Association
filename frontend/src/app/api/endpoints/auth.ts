import { User } from "@/types/user";
import api from "../apiSlice";

const auth = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { access: string; refresh: string },
      { username: string; password: string }
    >({
      query: (data) => ({
        url: "/auth/login/",
        method: "POST",
        data,
      }),
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "/auth/refresh/",
        method: "POST",
      }),
    }),
    verify: builder.mutation<void, { access: string }>({
      query: (data) => ({
        url: "/auth/verify/",
        method: "POST",
        data: { token: data.access },
      }),
    }),
    getAuthUser: builder.query<User, void>({
      query: () => ({ url: "/auth/authenticated-user/", method: "POST" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useVerifyMutation,
  useGetAuthUserQuery,
} = auth;
