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

export type ProjectsStats = {
  total_projects: number,
  in_progress: number,
  completed: number,
  total_incomes: number,
  total_expenses: number,
  net: number,
};
