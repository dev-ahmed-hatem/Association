import { Dayjs } from "dayjs";
import { Department } from "./department";
import { AssignedEmployee } from "./employee";
import { AssignedProject } from "./project";

export type TaskStatus = "مكتمل" | "غير مكتمل";
export type TaskPriority = "منخفض" | "متوسط" | "مرتفع";

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  departments: Department[];
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  assigned_to: AssignedEmployee[];
  project?: AssignedProject | null;
  project_tasks: Task[];
  created_at: string;
  created_by: string;
}

export type TasksStats = {
  total: number;
  completed: number;
  incomplete?: number;
  overdue: number;
  rate: number;
};

// Status & Priority Color Mapping
export const statusColors: Record<TaskStatus, string> = {
  مكتمل: "green",
  "غير مكتمل": "gold",
};

export const priorityColors: Record<TaskPriority, string> = {
  منخفض: "blue",
  متوسط: "orange",
  مرتفع: "red",
};

// form component params
export type TaskFormParams = {
  initialValues?: Task & {
    currently_assigned: AssignedEmployee[];
    current_project: AssignedProject;
  };
  taskId?: string;
  onSubmit?: (values: Task) => void;
};

// collected form values
export type TaskFormValues = Partial<Task> & {
  due_date: Dayjs;
};
