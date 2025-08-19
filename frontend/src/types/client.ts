export const rankValues = [
  "ملازم",
  "ملازم أول",
  "نقيب",
  "رائد",
  "مقدم",
  "عقيد",
  "عميد",
  "لواء",
  "لواء مساعد وزير",
] as const;

export const rankColors: Record<Rank, string> = {
  ملازم: "blue",
  "ملازم أول": "geekblue",
  نقيب: "cyan",
  رائد: "green",
  مقدم: "lime",
  عقيد: "gold",
  عميد: "orange",
  لواء: "volcano",
  "لواء مساعد وزير": "magenta",
};

export type Rank = (typeof rankValues)[number];

export interface Client {
  id: string;
  name: string;
  rank: Rank;
  national_id: string;
  birth_date: string;
  age: number;
  hire_date: string;
  phone_number: string;
  membership_type: string;
  work_entity: number | null;
  membership_number: string;
  subscription_date: string;
  marital_status: string;
  graduation_year: number;
  class_rank: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;

  seniority: string;
  rank_fee: number;
}
