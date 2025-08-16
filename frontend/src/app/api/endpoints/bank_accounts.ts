import api from "../apiSlice";
import queryString from "query-string";
import { QueryParams } from "@/types/query_param";
import { BankAccount } from "@/types/bank_account";

export const bankAccountsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccounts: builder.query<BankAccount[], QueryParams | void>({
      query: (params) => ({
        url: `/financials/bank-accounts/?${queryString.stringify(params || {})}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((account) => ({
                type: "BankAccount" as const,
                id: account.id,
              })),
              { type: "BankAccount", id: "LIST" },
            ]
          : [{ type: "BankAccount", id: "LIST" }],
    }),
    bankAccount: builder.mutation<
      BankAccount,
      { data?: Partial<BankAccount>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `financials/bank-accounts/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "BankAccount", id: "LIST" },
              { type: "BankAccount", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const { useGetBankAccountsQuery, useBankAccountMutation } =
  bankAccountsEndpoints;
