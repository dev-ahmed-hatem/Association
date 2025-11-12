import api from "../apiSlice";
import queryString from "query-string";
import { QueryParams } from "@/types/query_param";
import { FinancialRecord } from "@/types/financial_record";
import { PaginatedResponse } from "@/types/paginatedResponse";

export const financialRecordsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialRecords: builder.query<
      PaginatedResponse<FinancialRecord> | FinancialRecord[],
      QueryParams | void
    >({
      query: (params) => ({
        url: `/financials/financial-records/?${queryString.stringify(
          params || {}
        )}`,
      }),
      providesTags: (result) => {
        let array = Array.isArray(result) ? result : result?.data;
        return array
          ? [
              ...array.map((type) => ({
                type: "FinancialRecord" as const,
                id: type.id,
              })),
              { type: "FinancialRecord", id: "LIST" },
            ]
          : [{ type: "FinancialRecord", id: "LIST" }];
      },
    }),
    getFinancialRecord: builder.query<
      FinancialRecord,
      { id: string; format: "detailed" | "form_data" }
    >({
      query: ({ id, format }) => ({
        url: `/financials/financial-records/${id}/${format}/`,
        method: "GET",
      }),
      providesTags: (res, error, arg) => [
        { type: "FinancialRecord", id: arg.id },
      ],
    }),
    financialRecord: builder.mutation<
      FinancialRecord,
      { data?: Partial<FinancialRecord>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `financials/financial-records/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "FinancialRecord", id: "LIST" },
              { type: "FinancialRecord", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
    exportFinancialsSheet: builder.query<Blob, QueryParams | void>({
      query: (params) => ({
        url: `/financials/financial-records/export/?${queryString.stringify(
          params || {}
        )}`,
        method: "GET",
        responseType: "blob",
      }),
    }),
  }),
});

export const {
  useGetFinancialRecordsQuery,
  useLazyGetFinancialRecordsQuery,
  useGetFinancialRecordQuery,
  useFinancialRecordMutation,
  useLazyExportFinancialsSheetQuery,
} = financialRecordsEndpoints;
