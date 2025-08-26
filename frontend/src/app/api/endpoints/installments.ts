import api from "../apiSlice";
import queryString from "query-string";
import { Installment } from "@/types/installment";

export const installmentsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getInstallments: builder.query<Installment[], { client: string }>({
      query: (params) => ({
        url: `/financials/installments/?${queryString.stringify(params)}`,
      }),
      providesTags: [{ type: "Installment", id: "LIST" }],
    }),
    installment: builder.mutation<
      Installment,
      { data?: Partial<Installment>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `financials/intallments/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Installment", id: "LIST" },
              { type: "Client", id: "LIST" },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const { useInstallmentMutation, useGetInstallmentsQuery } =
  installmentsEndpoints;
