import { Rank } from "./client";

export type InstallmentStatus = "مدفوع" | "غير مدفوع";

export type Installment = {
  id: number;
  amount: string;
  client: number;
  installment_number: number;
  due_date: string;
  is_paid: boolean;
  paid_at?: string | null;
  financial_record?: number | null;
  status: InstallmentStatus;
  notes?: string
};

export type NamedInstallment = Installment & {
  client: string;
  client_id: string;
  membership_number: string;
  rank: Rank;
};
