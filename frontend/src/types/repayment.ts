export type RepaymentStatus = "مدفوع" | "غير مدفوع";

export type Repayment = {
  id: number;
  financial_record: string | null;
  loan: number;
  repayment_number: number;
  due_date: string;
  amount: number;
  status: RepaymentStatus;
  notes?: string | null;
  paid_at?: string | null;
};
