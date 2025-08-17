import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  BankOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const { Title } = Typography;

// Mock data
const bankAccountsData = [
  { name: "حساب البنك الأهلي", value: 12000 },
  { name: "حساب بنك مصر", value: 8500 },
  { name: "حساب CIB", value: 5000 },
  { name: "حساب النقدي", value: 7000 },
];

const transactionTypesData = [
  { name: "إيجار", type: "مصروف", value: 4000 },
  { name: "رواتب", type: "مصروف", value: 7000 },
  { name: "مشروعات", type: "إيراد", value: 10000 },
  { name: "أقساط", type: "إيراد", value: 12000 },
  { name: "رسوم اشتراك", type: "إيراد", value: 6000 },
  { name: "أخري", type: "إيراد", value: 9000 },
];

// Colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a855f7"];

const cardStyle = {
  borderRadius: "12px",
  height: "100%",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const FinancialOverview = () => {
  // group transaction types into income & expense
  const groupedTransactions = transactionTypesData.reduce(
    (acc, t) => {
      if (t.type === "إيراد") {
        acc.income.push(t);
      } else {
        acc.expense.push(t);
      }
      return acc;
    },
    {
      income: [] as typeof transactionTypesData,
      expense: [] as typeof transactionTypesData,
    }
  );

  return (
    <div className="p-6">
      {/* Bank Accounts Section */}
      <div className="mb-10 text-center">
        <Title level={3} className="!text-2xl !font-bold !mb-0 text-gray-800">
          إحصائيات الحسابات البنكية
        </Title>
        <p className="text-gray-500 mt-1">توزيع المعاملات حسب الحساب</p>
      </div>

      <Card className="shadow-md rounded-2xl">
        <div className="flex flex-wrap items-center">
          <div className="w-full md:w-1/2">
            <ul className="space-y-2">
              {bankAccountsData.map((acc, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{
                    backgroundColor: COLORS[i % COLORS.length] + "20",
                  }}
                >
                  <span className="font-semibold">{acc.name}</span>
                  <span className="text-gray-700 font-bold">
                    {acc.value} ج.م
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full md:w-1/2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bankAccountsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {bankAccountsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Transaction Types Section */}
      <div className="mt-12 mb-10 text-center">
        <Title level={3} className="!text-2xl !font-bold !mb-0 text-gray-800">
          إحصائيات أنواع المعاملات
        </Title>
        <p className="text-gray-500 mt-1">المقارنة بين الإيرادات والمصروفات</p>
      </div>

      <Card className="shadow-md rounded-2xl mb-10">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={transactionTypesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="#00C49F"
              name="إيراد"
              stackId="a"
              isAnimationActive={true}
            >
              {transactionTypesData.map((entry, index) => (
                <Cell
                  key={`cell-inc-${index}`}
                  fill={entry.type === "إيراد" ? "#00C49F" : "#FF4D4F"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card style={cardStyle}>
            <Statistic
              title="إيرادات الشهر"
              value={45000}
              prefix={<CalendarOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card style={cardStyle}>
            <Statistic
              title="مصروفات الشهر"
              value={20000}
              prefix={<CalendarOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card
          className="bg-minsk"
            style={{ ...cardStyle, color: "white" }}
          >
            <Statistic
              title={<span style={{ color: "white" }}>صافي الربح</span>}
              value={25000}
              prefix={<BankOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "white" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialOverview;
