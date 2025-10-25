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
  residence?: string;
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

  subscription_fee: number;
  prepaid?: number;

  dues?: {
    unpaid_subscriptions: number;
    unpaid_installments: number;
    unpaid_repayments: number;
  };
}

export type HomeStats = {
  rank_counts: { rank: Rank; العدد: number }[];
  active_status: [
    {
      name: "بالخدمة";
      value: number;
    },
    {
      name: "متقاعد";
      value: number;
    }
  ];
  entities_count: {
    name: string;
    id: number;
    count: number;
  }[];
  month_totals: { month: string; اشتراكات: number }[];
};

export type HomeFinancialStats = {
  month_totals: {
    incomes: number;
    expenses: number;
    net: number;
    subscriptions: number;
    installments: number;
    loans: number;
  };
  last_6_monthly_totals: {
    month: string;
    total_incomes: number;
    total_expenses: number;
  }[];
  subscriptions_count: number;
  unpaid_subscriptions: number;
  installments_count: number;
  unpaid_installments: number;

  till_now_subs_inst: {
    total_paid_subscriptions: number;
    total_paid_installments: number;
    total_unpaid_subscriptions: number;
    total_unpaid_installments: number;
  };
  loans_data: {
    month: string;
    value: number;
  }[];
};
