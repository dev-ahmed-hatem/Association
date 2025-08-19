import api from "../apiSlice";
import queryString from "query-string";
import { QueryParams } from "@/types/query_param";
import { RankFee } from "@/types/rank_fee";

export const rankFeesEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getRankFees: builder.query<RankFee[], QueryParams | void>({
      query: (params) => ({
        url: `/financials/rank-fees/?${queryString.stringify(params || {})}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((account) => ({
                type: "RankFee" as const,
                id: account.id,
              })),
              { type: "RankFee", id: "LIST" },
            ]
          : [{ type: "RankFee", id: "LIST" }],
    }),
    rankFee: builder.mutation<
      RankFee,
      { data?: Partial<RankFee>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `financials/rank-fees/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "RankFee", id: "LIST" },
              { type: "RankFee", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const { useGetRankFeesQuery, useRankFeeMutation } = rankFeesEndpoints;
