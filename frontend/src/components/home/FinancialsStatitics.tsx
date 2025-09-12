import React from "react";
import { Card, Col, Row, Statistic, Progress, Typography } from "antd";
import { RiseOutlined, FallOutlined, BankOutlined } from "@ant-design/icons";
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

const { Title } = Typography;

// Fake Data
const revenueExpenseData = [
  { month: "يناير", إيراد: 4000, مصروف: 2400 },
  { month: "فبراير", إيراد: 3000, مصروف: 1398 },
  { month: "مارس", إيراد: 5000, مصروف: 2000 },
  { month: "أبريل", إيراد: 4780, مصروف: 2181 },
];

const loansData = [
  { month: "يناير", قروض: 2400 },
  { month: "فبراير", قروض: 1398 },
  { month: "مارس", قروض: 2000 },
  { month: "أبريل", قروض: 2780 },
];

const subscriptionPieData = [
  { name: "مدفوع", value: 85 },
  { name: "متأخر", value: 15 },
];

const installmentsPieData = [
  { name: "مدفوع", value: 70 },
  { name: "متأخر", value: 30 },
];

const COLORS = ["#00C49F", "#FF8042"];

const FinancialStatistics: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="mb-10 text-center">
        <Title level={2} className="!text-3xl !font-bold !mb-0 text-gray-800">
          احصائيات مالية
        </Title>
        <p className="text-gray-500 mt-1">نظرة عامة على الإيرادات والمصروفات</p>
      </div>

      {/* Section 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <Statistic
              title={<span className="text-white">إجمالي الإيرادات</span>}
              value={150000}
              prefix={<RiseOutlined />}
              suffix="جنيه"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
            <Statistic
              title={<span className="text-white">إجمالي المصروفات</span>}
              value={85000}
              prefix={<FallOutlined />}
              suffix="جنيه"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <Statistic
              title={<span className="text-white">إجمالي القروض</span>}
              value={30000}
              prefix={<BankOutlined />}
              suffix="جنيه"
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="الإيرادات والمصروفات عبر الشهور">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueExpenseData}>
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
          <Card title="القروض عبر الشهور">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={loansData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="قروض" fill="#8884d8" />
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
          <Card title="الاشتراكات الشهرية (الحالي)">
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-green-600">
                عدد المدفوعة: 120
              </p>
              <p className="text-gray-500">بإجمالي: 24,000 ج.م</p>
              <p className="text-xl font-bold text-red-500 mt-2">
                عدد المتأخرة: 15
              </p>
              <p className="text-gray-500">بإجمالي: 3,000 ج.م</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={subscriptionPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {subscriptionPieData.map((entry, index) => (
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
          <Card title="الأقساط (الحالي)">
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-green-600">
                عدد المدفوعة: 80
              </p>
              <p className="text-gray-500">بإجمالي: 40,000 ج.م</p>
              <p className="text-xl font-bold text-red-500 mt-2">
                عدد المتأخرة: 10
              </p>
              <p className="text-gray-500">بإجمالي: 5,000 ج.م</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={installmentsPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {installmentsPieData.map((entry, index) => (
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
          <Card title="الاشتراكات الشهرية (الشهور السابقة)">
            <Progress percent={80} status="active" strokeColor="#00C49F" />
            <p className="mt-2 text-gray-500">20% من الاشتراكات متأخرة</p>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-green-600 font-bold">مدفوعة: 320</span>
              <span className="text-red-500 font-bold">متأخرة: 50</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="الأقساط (الشهور السابقة)">
            <Progress percent={65} status="exception" strokeColor="#FF8042" />
            <p className="mt-2 text-gray-500">35% من الأقساط متأخرة</p>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-green-600 font-bold">مدفوعة: 200</span>
              <span className="text-red-500 font-bold">متأخرة: 110</span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialStatistics;
