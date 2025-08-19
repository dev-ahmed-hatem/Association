import { FinancialRecord } from "./financial_record";

export type SubscriptionStatus = "مدفوع" | "غير مدفوع";

export type Subscription = {
  id: string;
  transaction: FinancialRecord;
  amount: number;
  date: string;
  status: SubscriptionStatus;
  notes?: string | null;
  paid_at?: string | null;
};
