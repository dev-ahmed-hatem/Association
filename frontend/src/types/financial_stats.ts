export type FinancialsStats = {
  bank_accounts: { name: string; value: number }[];
  transaction_types: { name: string; type: "إيراد" | "مصروف"; value: number }[];
};
