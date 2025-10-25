import { Rank } from "./client";

export type Loan = {
  id: number;
  client_data: {
    name: string;
    id: number;
    membership_number: number;
    rank: Rank;
    is_active: boolean;
  };
  client: string;
  amount: number;
  issued_date: string;
  notes?: string | null;
  repayments: {
    total: number;
    unpaid: number;
    paid: number;
  };
  is_completed: boolean;
};
