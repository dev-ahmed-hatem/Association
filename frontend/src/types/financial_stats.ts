type BankAccountTotal = { name: string; value: number };

export type FinancialsStats = {
  accounts_incomes: BankAccountTotal[];
  accounts_expenses: BankAccountTotal[];
  transaction_stats: { name: string; type: "إيراد" | "مصروف"; value: number }[];
  month_totals: { incomes: number; expenses: number; net: number };
};
