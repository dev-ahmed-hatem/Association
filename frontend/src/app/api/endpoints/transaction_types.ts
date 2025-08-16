import api from "../apiSlice";
import queryString from "query-string";
import { QueryParams } from "@/types/query_param";
import { TransactionType } from "@/types/transaction_type";

export const transactionTypesEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionTypes: builder.query<TransactionType[], QueryParams | void>({
      query: (params) => ({
        url: `/financials/transaction-types/?${queryString.stringify(params || {})}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((type) => ({
                type: "TransactionType" as const,
                id: type.id,
              })),
              { type: "TransactionType", id: "LIST" },
            ]
          : [{ type: "TransactionType", id: "LIST" }],
    }),
    transactionType: builder.mutation<
      TransactionType,
      { data?: Partial<TransactionType>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `financials/transaction-types/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "TransactionType", id: "LIST" },
              { type: "TransactionType", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const { useGetTransactionTypesQuery, useTransactionTypeMutation } =
  transactionTypesEndpoints;
