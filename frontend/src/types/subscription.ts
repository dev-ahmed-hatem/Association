import { FinancialRecord } from "./financial_record";

export type SubscriptionStatus = "مدفوع" | "غير مدفوع";

export type Subscription = {
  id: string;
  financial_record?: FinancialRecord;
  amount: number;
  date: string;
  notes?: string | null;
  paid_at?: string | null;
};
