import api from "../apiSlice";
import queryString from "query-string";
import {
  ProjectTransaction,
  ProjectTransactionsResponse,
} from "@/types/project_transaction";

export const projectTransactionsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectTransactions: builder.query<
      ProjectTransactionsResponse,
      { project: string }
    >({
      query: (params) => ({
        url: `/projects/project-transactions/?${queryString.stringify(params)}`,
      }),
      providesTags: [{ type: "ProjectTransaction", id: "LIST" }],
    }),
    projectTransaction: builder.mutation<
      ProjectTransaction,
      { data?: Partial<ProjectTransaction>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `projects/project-transactions/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Project", id: "LIST" },
              { type: "ProjectTransaction", id: "LIST" },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const { useGetProjectTransactionsQuery, useProjectTransactionMutation } =
  projectTransactionsEndpoints;
