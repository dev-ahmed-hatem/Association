import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Progress,
  Typography,
  Button,
  Result,
} from "antd";
import {
  RiseOutlined,
  FallOutlined,
  BankOutlined,
  AccountBookOutlined,
  FileDoneOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useGetHomeFinancialStatsQuery } from "@/app/api/endpoints/clients";
import dayjs from "dayjs";
import Loading from "../Loading";

const { Title } = Typography;

type PieData = [
  { name: "مدفوع"; value: number },
  { name: "متأخر"; value: number }
];

type ProgressData = {
  paid: number;
  unpaid: number;
  paidPercent: number;
  unpaidPercent: number;
};

const loansData = [
  { month: "يناير", قروض: 2400 },
  { month: "فبراير", قروض: 1398 },
  { month: "مارس", قروض: 2000 },
  { month: "أبريل", قروض: 2780 },
];

const COLORS = ["#00C49F", "#FF8042"];

const FinancialStatistics: React.FC = () => {
  const [pieData, setPieData] = useState<{
    subscriptions: PieData;
    installments: PieData;
  } | null>();
  const [percent, setPercent] =
    useState<Record<"subscriptions" | "installments", ProgressData>>();
  const {
    data: homeFinancialStats,
    isFetching,
    isError,
    refetch,
  } = useGetHomeFinancialStatsQuery();

  useEffect(() => {
    if (homeFinancialStats) {
      setPieData({
        subscriptions: [
          { name: "مدفوع", value: homeFinancialStats.subscriptions_count },
          {
            name: "متأخر",
            value:
              homeFinancialStats.active_clients -
              homeFinancialStats.subscriptions_count,
          },
        ],
        installments: [
          {
            name: "مدفوع",
            value: homeFinancialStats.installments_count,
          },
          { name: "متأخر", value: homeFinancialStats.unpaid_installments },
        ],
      });

      const {
        total_paid_installments: ins_paid,
        total_paid_subscriptions: subs_paid,
        total_unpaid_installments: ins_unpaid,
        total_unpaid_subscriptions: subs_unpaid,
      } = homeFinancialStats.last_6_month_subs_ins;
      setPercent({
        subscriptions: {
          paid: subs_paid,
          unpaid: subs_unpaid,
          paidPercent:
            Math.round((subs_paid / (subs_paid + subs_unpaid)) * 100) || 0,
          unpaidPercent:
            Math.round((subs_unpaid / (subs_paid + subs_unpaid)) * 100) || 0,
        },
        installments: {
          paid: ins_paid,
          unpaid: ins_unpaid,
          paidPercent:
            Math.round((ins_paid / (ins_paid + ins_unpaid)) * 100) || 0,
          unpaidPercent:
            Math.round((ins_unpaid / (ins_paid + ins_unpaid)) * 100) || 0,
        },
      });
    }
  }, [homeFinancialStats]);

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
    <div className="space-y-8">
      <div className="mb-10 text-center">
        <Title level={2} className="!text-3xl !font-bold !mb-0 text-gray-800">
          احصائيات مالية
        </Title>
        <p className="text-gray-500 mt-1">
          إجماليات الشهر ({dayjs().month() + 1} - {dayjs().year()})
        </p>
      </div>

      {/* Section 1 */}
      <Row gutter={[16, 16]}>
        {/* الإيرادات */}
        <Col xs={24} md={8} lg={8}>
          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <Statistic
              title={<span className="text-white">إجمالي الإيرادات</span>}
              value={homeFinancialStats?.month_totals.incomes}
              prefix={<RiseOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>

        {/* المصروفات */}
        <Col xs={24} md={8} lg={8}>
          <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
            <Statistic
              title={<span className="text-white">المصروفات</span>}
              value={homeFinancialStats?.month_totals.expenses}
              prefix={<FallOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>

        {/* الصافي */}
        <Col xs={24} md={8} lg={8}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <Statistic
              title={<span className="text-white">الصافي</span>}
              value={homeFinancialStats?.month_totals.net}
              prefix={<AccountBookOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>

        {/* الاشتراكات */}
        <Col xs={24} md={8} lg={8}>
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
            <Statistic
              title={<span className="text-white">الاشتراكات</span>}
              value={homeFinancialStats?.month_totals.subscriptions}
              prefix={<UsergroupAddOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>

        {/* الأقساط */}
        <Col xs={24} md={8} lg={8}>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
            <Statistic
              title={<span className="text-white">الأقساط</span>}
              value={homeFinancialStats?.month_totals.installments}
              prefix={<FileDoneOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>

        {/* القروض */}
        <Col xs={24} md={8} lg={8}>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <Statistic
              title={<span className="text-white">القروض</span>}
              value={30000}
              prefix={<BankOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="الإيرادات والمصروفات عبر الشهور" className="shadow-lg">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={homeFinancialStats?.last_6_monthly_totals.map(
                  (month) => ({
                    month: dayjs(month.month, "YYYY-MM-DD").format("MMMM"),
                    إيراد: month.total_incomes,
                    مصروف: month.total_expenses,
                  })
                )}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF8042" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="إيراد"
                  stroke="#00C49F"
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="مصروف"
                  stroke="#FF8042"
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="القروض عبر الشهور" className="shadow-lg">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={loansData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="قروض" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Section 2 */}
      <Title level={3} className="text-center text-lg font-bold mb-6">
        الاشتراكات الشهرية - الأقساط
      </Title>

      <Row gutter={[16, 16]}>
        {/* Subscriptions (Current) */}
        <Col xs={24} md={12}>
          <Card title="الاشتراكات الشهرية (الشهر الحالي)" className="shadow-lg">
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-green-600">
                عدد المدفوعة: {homeFinancialStats?.subscriptions_count}
              </p>
              <p className="text-gray-500">
                بإجمالي: {homeFinancialStats?.month_totals.subscriptions} ج.م
              </p>
              <p className="text-xl font-bold text-red-500 mt-2">
                عدد المتأخرة: {pieData?.subscriptions[1].value}
              </p>
              {/* <p className="text-gray-500">بإجمالي: 3,000 ج.م</p> */}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData?.subscriptions}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData?.subscriptions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Installments (Current) */}
        <Col xs={24} md={12}>
          <Card title="الأقساط (الشهر الحالي)" className="shadow-lg">
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-green-600">
                عدد المدفوعة: {homeFinancialStats?.installments_count}
              </p>
              <p className="text-gray-500">
                بإجمالي: {homeFinancialStats?.month_totals.installments} ج.م
              </p>
              <p className="text-xl font-bold text-red-500 mt-2">
                عدد المتأخرة: {homeFinancialStats?.unpaid_installments}
              </p>
              {/* <p className="text-gray-500">بإجمالي: 5,000 ج.م</p> */}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData?.installments}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData?.installments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Previous Months Stats */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={12}>
          <Card
            title="الاشتراكات الشهرية (الشهور السابقة)"
            className="shadow-lg"
          >
            <Progress
              percent={percent?.subscriptions.paidPercent}
              status="active"
              strokeColor="#00C49F"
            />
            <p className="mt-2 text-gray-500">
              {percent?.subscriptions.unpaidPercent}% من الاشتراكات متأخرة
            </p>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-green-600 font-bold">
                مدفوعة: {percent?.subscriptions.paid}
              </span>
              <span className="text-red-500 font-bold">
                متأخرة: {percent?.subscriptions.unpaid}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="الأقساط (الشهور السابقة)" className="shadow-lg">
            <Progress
              percent={percent?.installments.paidPercent}
              status="active"
              strokeColor="#FF8042"
            />
            <p className="mt-2 text-gray-500">
              {percent?.installments.unpaidPercent}% من الأقساط متأخرة
            </p>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-green-600 font-bold">
                مدفوعة: {percent?.installments.paid}
              </span>
              <span className="text-red-500 font-bold">
                متأخرة: {percent?.installments.unpaid}
              </span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialStatistics;
