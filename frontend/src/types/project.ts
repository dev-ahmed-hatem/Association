export type ProjectStatus = "قيد التنفيذ" | "منتهي";

export type Project = {
  id: number;
  name: string;
  start_date: string;
  status: ProjectStatus;
  created_by?: number | null;

  total_incomes: number;
  total_expenses: number;
  created_at: string;
  updated_at: string;
};
