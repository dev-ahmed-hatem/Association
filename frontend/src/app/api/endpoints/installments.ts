import api from "../apiSlice";
import queryString from "query-string";
import { Installment, NamedInstallment } from "@/types/installment";
import { PaginatedResponse } from "@/types/paginatedResponse";

export const installmentsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getInstallments: builder.query<Installment[], { client: string }>({
      query: (params) => ({
        url: `/financials/installments/?${queryString.stringify(params)}`,
      }),
      providesTags: [{ type: "Installment", id: "LIST" }],
    }),
    getMonthInstallments: builder.query<
      PaginatedResponse<NamedInstallment>,
      {
        month: string;
        year: string;
        search: string;
        page: number;
        page_size: number;
        search_type: string;
      }
    >({
      query: (params) => ({
        url: `/financials/get-month-installments/?${queryString.stringify(
          params
        )}`,
      }),
      providesTags: (result, error, args) => [
        { type: "Installment", id: `${args.year}-${args.month}` },
        { type: "Installment", id: "LIST" },
      ],
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

export const {
  useInstallmentMutation,
  useGetInstallmentsQuery,
  useGetMonthInstallmentsQuery,
} = installmentsEndpoints;
