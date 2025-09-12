import api from "../apiSlice";
import queryString from "query-string";
import { NamedSubscription, Subscription } from "@/types/subscription";
import { PaginatedResponse } from "@/types/paginatedResponse";

export const subscriptionsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getYearSubscriptions: builder.query<
      Record<string, Subscription>,
      { year: number; client: string }
    >({
      query: (params) => ({
        url: `/financials/get-year-subscriptions/?${queryString.stringify(
          params
        )}`,
      }),
      providesTags: (result, error, args) => [
        { type: "Subscription", id: `${args.year}-${args.client}` },
        { type: "Subscription", id: "LIST" },
      ],
    }),
    getMonthSubscriptions: builder.query<
      PaginatedResponse<NamedSubscription>,
      {
        month: string;
        year: string;
        search: string;
        page: number;
        page_size: number;
      }
    >({
      query: (params) => ({
        url: `/financials/get-month-subscriptions/?${queryString.stringify(
          params
        )}`,
      }),
      providesTags: (result, error, args) => [
        { type: "Subscription", id: `${args.year}-${args.month}` },
        { type: "Subscription", id: "LIST" },
      ],
    }),
    subscription: builder.mutation<
      Subscription,
      { data?: Partial<Subscription>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `financials/subscriptions/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Entities LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Subscription", id: "LIST" },
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
  useGetYearSubscriptionsQuery,
  useGetMonthSubscriptionsQuery,
  useSubscriptionMutation,
} = subscriptionsEndpoints;
