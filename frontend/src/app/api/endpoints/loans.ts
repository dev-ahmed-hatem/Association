import api from "../apiSlice";
import queryString from "query-string";
import { QueryParams } from "@/types/query_param";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { Loan } from "@/types/loan";

export const loansEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getLoans: builder.query<
      PaginatedResponse<Loan> | Loan[],
      QueryParams | void
    >({
      query: (params) => ({
        url: `/financials/loans/?${queryString.stringify(params || {})}`,
      }),
      providesTags: (result) => {
        let array = Array.isArray(result) ? result : result?.data;
        return array
          ? [
              ...array.map((type) => ({
                type: "Loan" as const,
                id: type.id,
              })),
              { type: "Loan", id: "LIST" },
            ]
          : [{ type: "Loan", id: "LIST" }];
      },
    }),
    getLoan: builder.query<Loan, { id: string }>({
      query: ({ id }) => ({
        url: `/financials/loans/${id}/`,
        method: "GET",
      }),
      providesTags: (res, error, arg) => [{ type: "Loan", id: arg.id }],
    }),
    loan: builder.mutation<
      Loan,
      { data?: Partial<Loan>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `financials/loans/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Loan", id: "LIST" },
              { type: "Loan", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const {
  useGetLoansQuery,
  useLazyGetLoansQuery,
  useGetLoanQuery,
  useLoanMutation,
} = loansEndpoints;
