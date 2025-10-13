import { Rank } from "./client";

export type Loan = {
  id: number;
  client_data: {
    name: string;
    id: number;
    membership_number: number;
    rank: Rank;
  };
  client: string;
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
