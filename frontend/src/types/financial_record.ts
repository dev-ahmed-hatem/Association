import { BankAccount } from "./bank_account";
import { TransactionType } from "./transaction_type";

export type PaymentMethod =
  | "نقدي"
  | "إيداع بنكي"
  | "مصروف بنكي"
  | "شيك"
  | "تحويل بنكي";

export const paymentMethodColors: Record<PaymentMethod, string> = {
  نقدي: "#f97316", // orange
  "إيداع بنكي": "#8b5cf6", // purple
  "مصروف بنكي": "#10b981", // green
  شيك: "#3b82f6", // blue
  "تحويل بنكي": "#ef4444", // red
};

export const receiptPaymentMethods: PaymentMethod[] = [
  "إيداع بنكي",
  "مصروف بنكي",
  "تحويل بنكي",
  "شيك",
];

export const incomePaymentMethods: PaymentMethod[] = [
  "نقدي",
  "إيداع بنكي",
  "شيك",
  "تحويل بنكي",
];

export const expensePaymentMethods: PaymentMethod[] = [
  "نقدي",
  "مصروف بنكي",
  "شيك",
  "تحويل بنكي",
];

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

  transaction_type_name?: string;
};
