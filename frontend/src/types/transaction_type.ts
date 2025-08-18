export type TransactionKind = "إيراد" | "مصروف";

export const transactionTypeColors: Record<TransactionKind, string> = {
  إيراد: "green",
  مصروف: "red",
};

export const TransactionKindArabic: Record<string, TransactionKind> = {
  income: "إيراد",
  expense: "مصروف",
};

export const TransactionKindEnglish: Record<TransactionKind, "income" | "expense"> = {
  إيراد: "income",
  مصروف: "expense",
};

export type TransactionType = {
  id: string;
  name: string;
  type: TransactionKind;
};
