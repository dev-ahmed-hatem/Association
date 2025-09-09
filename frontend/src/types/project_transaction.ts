import { ReactNode } from "react";
import { PaymentMethod } from "./financial_record";

export type ProjectTransaction = {
  id: string;
  statement: ReactNode;
  amount: number;
  date: string;
  financial_record: number;
  payment_method: PaymentMethod;
  notes?: string;
  project: number;
  bank_account?: number | null;
  receipt_number: string;
};

export type ProjectTransactionsResponse = {
  incomes: {
    transactions: ProjectTransaction[];
    total: number;
  };
  expenses: {
    transactions: ProjectTransaction[];
    total: number;
  };
  net: number;
};
