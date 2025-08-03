export type FinancialItem = {
  id: string;
  type: "income" | "expense";
  date: string; // YYYY-MM-DD format
  category: string; // Selected from predefined options
  description?: string;
  amount: number;
};
