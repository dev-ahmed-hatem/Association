import qs from "query-string";
import api from "../apiSlice";
import { FinancialsStats } from "@/types/financial_stats";

export const financialsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialsStats: builder.query<
      FinancialsStats,
      { from: string; to: string }
    >({
      query: (dates) => ({
        url: `/financials/get-financials-stats/?${qs.stringify(dates)}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetFinancialsStatsQuery } = financialsEndpoints;
