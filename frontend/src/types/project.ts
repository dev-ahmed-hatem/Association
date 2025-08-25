export type ProjectStatus = "قيد التنفيذ" | "منتهي";

export type Project = {
  id: number;
  name: string;
  start_date: string;
  status: ProjectStatus;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
};
