import api from "../apiSlice";
import queryString from "query-string";
import { QueryParams } from "@/types/query_param";
import { User } from "@/types/user";
import { ChangePasswordFields } from "@/components/settings/account/ChangePassword";

export const usersEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], QueryParams | void>({
      query: (params) => ({
        url: `/users/users/?${queryString.stringify(params || {})}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((entity) => ({
                type: "User" as const,
                id: entity.id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    user: builder.mutation<
      User,
      { data?: Partial<User>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `users/users/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "User", id: "LIST" },
              { type: "User", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
    getPermissionsList: builder.query<string[], string>({
      query: (user_id) => ({
        url: `/users/users/${user_id}/permissions_list/`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        { type: "PermissionsList", id: arg },
      ],
    }),
    setPermissions: builder.mutation<
      any,
      { user_id: string; permissions: Record<string, boolean> }
    >({
      query: (arg) => ({
        url: `/users/users/${arg.user_id}/set_permissions/`,
        method: "POST",
        data: arg.permissions,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PermissionsList", id: arg.user_id },
      ],
    }),
    changePassword: builder.mutation<void, ChangePasswordFields>({
      query: (data) => ({
        url: "/users/change-password/",
        method: "PATCH",
        data,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUserMutation,
  useGetPermissionsListQuery,
  useSetPermissionsMutation,
  useChangePasswordMutation,
} = usersEndpoints;
