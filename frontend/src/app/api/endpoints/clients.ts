import api from "../apiSlice";
import { PaginatedResponse } from "@/types/paginatedResponse";
import qs from "query-string";
import { Client, HomeFinancialStats, HomeStats } from "@/types/client";
import { QueryParams } from "@/types/query_param";

export const clientsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<
      PaginatedResponse<Client> | Client[],
      QueryParams | void
    >({
      query: (params) => ({
        url: `/clients/clients?${qs.stringify(params || {})}`,
        method: "GET",
      }),
      providesTags: (result) => {
        let array = Array.isArray(result) ? result : result?.data;
        return array
          ? [
              ...array.map((client) => ({
                type: "Client" as const,
                id: client.id,
              })),
              { type: "Client", id: "LIST" },
            ]
          : [{ type: "Client", id: "LIST" }];
      },
    }),
    getClient: builder.query<
      Client,
      { id: string; format: "detailed" | "form_data" }
    >({
      query: ({ id, format }) => ({
        url: `/clients/clients/${id}/${format}/`,
        method: "GET",
      }),
      providesTags: (res, error, arg) => [{ type: "Client", id: arg.id }],
    }),
    client: builder.mutation<
      Client,
      { data: Partial<Client>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `clients/clients/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Clients LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Client", id: "LIST" },
              { type: "Client", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
    switchClientActive: builder.mutation<{ is_active: boolean }, string>({
      query: (id) => ({
        url: `/clients/clients/${id}/switch_active/`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Client", id: "LIST" }],
    }),
    deleteFinancialRecords: builder.mutation<void, string>({
      query: (id) => ({
        url: `/clients/clients/${id}/delete_financial_records/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Client", id: "LIST" },
        { type: "Subscription", id: "LIST" },
        { type: "Installment", id: "LIST" },
        { type: "Client", id: arg },
      ],
    }),
    getHomeStats: builder.query<HomeStats, void>({
      query: () => ({
        url: "/clients/get-home-stats/",
        method: "GET",
      }),
    }),
    getHomeFinancialStats: builder.query<HomeFinancialStats, void>({
      query: () => ({
        url: "/clients/get-home-financial-stats/",
        method: "GET",
      }),
    }),
    exportClientsSheet: builder.query<Blob, QueryParams | void>({
      query: (params) => ({
        url: `/clients/clients/export/?${qs.stringify(params || {})}`,
        method: "GET",
        responseType: "blob",
      }),
    }),
    exportClientYearSubsSheet: builder.query<
      Blob,
      {
        client_id: string;
        year: string;
        type: "subscriptions" | "installments";
      }
    >({
      query: ({ client_id, year, type }) => ({
        url: `/clients/clients/${client_id}/export_${type}/?year=${year}`,
        method: "GET",
        responseType: "blob",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useClientMutation,
  useSwitchClientActiveMutation,
  useDeleteFinancialRecordsMutation,
  useGetHomeStatsQuery,
  useGetHomeFinancialStatsQuery,
  useLazyExportClientsSheetQuery,
  useLazyExportClientYearSubsSheetQuery,
} = clientsEndpoints;
