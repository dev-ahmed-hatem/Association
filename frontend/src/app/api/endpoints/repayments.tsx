import api from "../apiSlice";
import queryString from "query-string";
import { Repayment } from "@/types/repayment";

export const repaymentsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getRepayments: builder.query<Repayment[], { loan_id: string }>({
      query: (params) => ({
        url: `/financials/repayments/?${queryString.stringify(params || {})}`,
      }),
      providesTags: (result) => {
        return result
          ? [
              ...result.map((repayment) => ({
                type: "Repayment" as const,
                id: repayment.id,
              })),
              { type: "Repayment", id: "LIST" },
            ]
          : [{ type: "Repayment", id: "LIST" }];
      },
    }),
    repayment: builder.mutation<
      Repayment,
      { data?: Partial<Repayment>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `financials/repayments/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;

          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Repayment", id: "LIST" },
              { type: "Repayment", id: response.id },
              { type: "Loan", id: arg.data?.loan },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const { useGetRepaymentsQuery, useRepaymentMutation } =
  repaymentsEndpoints;
