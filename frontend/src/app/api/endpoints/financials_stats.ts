import api from "../apiSlice";
import { FinancialsStats } from "@/types/financial_stats";

export const financialsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialsStats: builder.query<FinancialsStats, void>({
      query: () => ({
        url: "/financials/get-financials-stats/",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetFinancialsStatsQuery } = financialsEndpoints;
