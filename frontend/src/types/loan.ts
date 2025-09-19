export type Loan = {
  id: number;
  client: string;
  client_name: string;
  amount: number;
  issued_date: string;
  notes?: string | null;
  financial_record: string;
  repayments: {
    total: number;
    unpaid: number;
    paid: number;
  };
  is_completed: boolean;
};
