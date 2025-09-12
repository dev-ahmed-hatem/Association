import React from "react";
import { Button, Card, Result, Typography } from "antd";
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
import WorkEntityStatsCards from "./WorkentitiesStats";
import { useGetWorkEntitiesQuery } from "@/app/api/endpoints/workentities";
import Loading from "../Loading";
import { useGetHomeStatsQuery } from "@/app/api/endpoints/clients";

const { Title } = Typography;

const COLORS = ["#00ca4b", "#FF8042"];

const subscriptionData = [
  { month: "2024-01", اشتراكات: 3 },
  { month: "2024-02", اشتراكات: 5 },
  { month: "2024-03", اشتراكات: 8 },
  { month: "2024-04", اشتراكات: 4 },
  { month: "2024-05", اشتراكات: 10 },
  { month: "2024-06", اشتراكات: 7 },
];

const ClientStats: React.FC = () => {
  const {
    data: homeStats,
    isFetching,
    isError,
    refetch,
  } = useGetHomeStatsQuery();
  const { data: entities } = useGetWorkEntitiesQuery({
    no_pagination: true,
  });

  if (isFetching) return <Loading />;
  if (isError)
    return (
      <Result
        status="error"
        title={<span className="font-bold">خطأ</span>}
        subTitle={"حدث خطأ أثناء الحصول على الإحصائيات"}
        extra={[
          <Button key="retry" type="primary" onClick={refetch}>
            إعادة المحاولة
          </Button>,
        ]}
      />
    );

  return (
    <div className="p-4 gap-6">
      {/* Dashboard Title */}
      <div className="mb-10 text-center">
        <Title level={2} className="!text-3xl !font-bold !mb-0 text-gray-800">
          احصائيات الأعضاء
        </Title>
        <p className="text-gray-500 mt-1">نظرة عامة على بيانات الأعضاء</p>
      </div>

      {/* Rank Distribution */}
      <Card className="shadow-lg rounded-2xl mb-8">
        <Title level={4} className="text-center mb-4">
          توزيع الأعضاء حسب الرتبة
        </Title>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={homeStats?.rank_counts}>
            <XAxis dataKey="rank" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="العدد" fill="#1890ff" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="flex w-full flex-wrap items-center justify-between gap-10">
        {/* Active vs Inactive */}
        <Card className="shadow-lg rounded-2xl w-full md:w-[46%]">
          <Title level={4} className="text-center mb-4">
            التوزيع حسب الخدمة
          </Title>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={homeStats?.active_status}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {homeStats?.active_status.map((_, index) => (
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
                dataKey="اشتراكات"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {isFetching && <Loading />}
      {entities && (
        <WorkEntityStatsCards entities={homeStats!.entities_count} />
      )}
    </div>
  );
};

export default ClientStats;
