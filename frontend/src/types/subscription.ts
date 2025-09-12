import { Rank } from "./client";
import { FinancialRecord } from "./financial_record";
import { Dayjs } from "dayjs";

export type SubscriptionStatus = "مدفوع" | "غير مدفوع";

export type Subscription = {
  id: string;
  financial_record?: FinancialRecord;
  amount: number;
  date: string;
  notes?: string | null;
  paid_at?: string | null;
};

export type SubscriptionDisplay = Omit<Subscription, "date"> & {
  status: SubscriptionStatus;
  date: string | Dayjs;
};

export type NamedSubscription = SubscriptionDisplay & {
  client: string;
  client_id: string;
  membership_number: string;
  rank: Rank;
};
