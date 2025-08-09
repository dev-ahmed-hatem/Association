import { WorkEntity } from "@/types/workentity";
import api from "../apiSlice";
import queryString from "query-string";

export const workEntitiesEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkEntities: builder.query<WorkEntity[], Record<string, any>>({
      query: (params) => ({
        url: `/clients/workentities/?${queryString.stringify({
          no_pagination: true,
          ...params,
        })}`,
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
  }),
});

export const { useGetWorkEntitiesQuery } = workEntitiesEndpoints;
