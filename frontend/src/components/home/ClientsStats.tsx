import React from "react";
import { Card, Typography } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const { Title } = Typography;

// Fake data
const rankData = [
  { rank: "ملازم", total: 12 },
  { rank: "ملازم أول", total: 8 },
  { rank: "نقيب", total: 15 },
  { rank: "رائد", total: 6 },
  { rank: "مقدم", total: 12 },
  { rank: "عقيد", total: 8 },
  { rank: "عميد", total: 15 },
  { rank: "لواء", total: 6 },
  { rank: "لواء مساعد وزير", total: 8 },
];

const activeData = [
  { name: "في الخدمة", value: 28 },
  { name: "متقاعد", value: 5 },
];

const COLORS = ["#00C49F", "#FF8042"];

const subscriptionData = [
  { month: "2024-01", total: 3 },
  { month: "2024-02", total: 5 },
  { month: "2024-03", total: 8 },
  { month: "2024-04", total: 4 },
  { month: "2024-05", total: 10 },
  { month: "2024-06", total: 7 },
];

const ClientStats: React.FC = () => {
  return (
    <div className="p-4 gap-6">
      {/* Dashboard Title */}
      <div className="mb-10 text-center">
        <Title level={2} className="!text-3xl !font-bold !mb-0 text-gray-800">
          احصائيات الأعضاء
        </Title>
        <p className="text-gray-500 mt-1">نظرة عامة على بيانات العملاء</p>
      </div>

      {/* Rank Distribution */}
      <Card className="shadow-lg rounded-2xl mb-8">
        <Title level={4} className="text-center mb-4">
          توزيع الأعضاء حسب الرتبة
        </Title>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={rankData}>
            <XAxis dataKey="rank" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#1890ff" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="flex w-full flex-wrap items-center justify-between gap-10">
        {/* Active vs Inactive */}
        <Card className="shadow-lg rounded-2xl w-full md:w-[46%]">
          <Title level={4} className="text-center mb-4">
            حالة النشاط
          </Title>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={activeData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {activeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Subscription Growth */}
        <Card className="shadow-lg rounded-2xl w-full md:w-[46%]">
          <Title level={4} className="text-center mb-4">
            نمو الاشتراكات
          </Title>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={subscriptionData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default ClientStats;
