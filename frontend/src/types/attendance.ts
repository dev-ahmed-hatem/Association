import { AssignedEmployee } from "./employee";

export type Attendance = {
  id: number;
  employee: AssignedEmployee;
  date: string;
  check_in: string;
  check_out?: string;
};

export type AttendanceSummary = {
  id: number;
  employee: string;
  check_in: string;
  check_out: string | null;
  deductions: number | null;
  extra: number | null;
};

export type AttendanceSettings = {
  check_in: string;
  check_out: string;
  grace_period: number;
};
