import { WorkEntity } from "@/types/workentity";
import api from "../apiSlice";
import queryString from "query-string";
import { QueryParams } from "@/types/query_param";

export const workEntitiesEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkEntities: builder.query<WorkEntity[], QueryParams | void>({
      query: (params) => ({
        url: `/clients/workentities/?${queryString.stringify(params || {})}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((entity) => ({
                type: "WorkEntity" as const,
                id: entity.id,
              })),
              { type: "WorkEntity", id: "LIST" },
            ]
          : [{ type: "WorkEntity", id: "LIST" }],
    }),
    entity: builder.mutation<
      WorkEntity,
      { data?: Partial<WorkEntity>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `clients/workentities/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "WorkEntity", id: "LIST" },
              { type: "WorkEntity", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const { useGetWorkEntitiesQuery, useEntityMutation } =
  workEntitiesEndpoints;
