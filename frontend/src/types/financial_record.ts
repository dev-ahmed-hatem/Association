import { BankAccount } from "./bank_account";
import { TransactionType } from "./transaction_type";

export type PaymentMethod = "نقدي" | "إيصال بنكي";

export const paymentMethodColors: Record<PaymentMethod, string> = {
  نقدي: "#f97316", // orange
  "إيصال بنكي": "#8b5cf6", // purple
};

export type FinancialRecord = {
  id: string;
  amount: number;
  transaction_type: TransactionType;
  date: string;
  payment_method: PaymentMethod;
  bank_account?: BankAccount | null;
  receipt_number?: string | null;
  notes?: string | null;
  created_at: string;
  created_by: number;
};
