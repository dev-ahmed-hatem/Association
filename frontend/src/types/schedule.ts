export type ScheduleType = "طوال اليوم" | "وقت محدد" | "فترة من اليوم";

export type Schedule = {
  id: string;
  title: string;
  type: ScheduleType;
  description?: string;

  date: string; // بصيغة YYYY-MM-DD
  time?: string;
  period?: { start: string; end: string };

  startTime?: string; // HH:mm
  endTime?: string; // HH:mm

  location?: string;
  notes?: string;
  employeeIds?: string[];
};
