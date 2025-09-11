import {
  Button,
  Card,
  Col,
  Divider,
  Result,
  Row,
  Statistic,
  Typography,
} from "antd";
import { CalendarOutlined, BankOutlined } from "@ant-design/icons";
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
} from "recharts";
import { dayjs } from "@/utils/locale";
import { useGetFinancialsStatsQuery } from "@/app/api/endpoints/financials_stats";
import Loading from "../Loading";

const { Title } = Typography;

// Colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a855f7"];

const cardStyle = {
  borderRadius: "12px",
  height: "100%",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const FinancialOverview = () => {
  const { data, isFetching, isError, refetch } = useGetFinancialsStatsQuery();

  if (isFetching) return <Loading />;
  if (isError)
    return (
      <Result
        status="error"
        title={<span className="font-bold">خطأ</span>}
        subTitle={"حدث خطأ أثناء الحصول على الإحصائيات المالية"}
        extra={[
          <Button key="retry" type="primary" onClick={refetch}>
            إعادة المحاولة
          </Button>,
        ]}
      />
    );
  return (
    <div className="p-6">
      {/* Month Totals */}
      <div className="mb-10 text-center">
        <Title level={3} className="!text-2xl !font-bold !mb-0 text-gray-800">
          إجماليات الشهر ({dayjs().month() + 1} - {dayjs().year()})
        </Title>
        <p className="text-gray-500 mt-1">إجمالي الإيرادات والمصروفات</p>
      </div>

      <Row gutter={[16, 16]} className="mb-10">
        <Col xs={24} md={12} lg={8}>
          <Card style={cardStyle}>
            <Statistic
              title="إيرادات الشهر"
              value={data?.month_totals.incomes}
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
              value={data?.month_totals.expenses}
              prefix={<CalendarOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="bg-minsk" style={{ ...cardStyle, color: "white" }}>
            <Statistic
              title={<span style={{ color: "white" }}>الصافي</span>}
              value={data?.month_totals.net}
              prefix={<BankOutlined />}
              suffix="ج.م"
              valueStyle={{ color: "white" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider className="my-12" />

      {/* Bank Accounts Section */}
      <div className="mb-10 text-center">
        <Title level={3} className="!text-2xl !font-bold !mb-0 text-gray-800">
          إحصائيات الحسابات البنكية
        </Title>
        <p className="text-gray-500 mt-1">توزيع المعاملات حسب الحساب</p>
      </div>

      <Card className="shadow-md rounded-2xl">
        {/* Bank Accounts Incomes */}
        <>
          <div className="w-full mb-5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 p-3 shadow-md">
            <Title
              level={5}
              className="!text-xl !font-bold !mb-0 text-white text-center"
            >
              الإيرادات
            </Title>
          </div>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2">
              <ul className="space-y-3">
                {data?.accounts_incomes.map((acc, i) => (
                  <li
                    key={i}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: COLORS[i % COLORS.length] + "20",
                    }}
                  >
                    {/* Account Name */}
                    <span className="font-semibold text-base sm:text-lg text-gray-800 break-words">
                      {acc.name}
                    </span>

                    {/* Value */}
                    <span className="text-red-700 font-bold text-sm sm:text-base mt-2 sm:mt-0">
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
                    data={data?.accounts_incomes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data?.accounts_incomes.map((entry, index) => (
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
        </>

        {/* Bank Account Expenses */}
        <>
          <div className="w-full mb-5 rounded-xl bg-gradient-to-r from-red-400 via-pink-500 to-rose-600 p-3 shadow-md">
            <Title
              level={5}
              className="!text-xl !font-bold !mb-0 text-white text-center"
            >
              المصروفات
            </Title>
          </div>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2">
              <ul className="space-y-3">
                {data?.accounts_expenses.map((acc, i) => (
                  <li
                    key={i}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: COLORS[i % COLORS.length] + "20",
                    }}
                  >
                    {/* Account Name */}
                    <span className="font-semibold text-base sm:text-lg text-gray-800 break-words">
                      {acc.name}
                    </span>

                    {/* Value */}
                    <span className="text-red-700 font-bold text-sm sm:text-base mt-2 sm:mt-0">
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
                    data={data?.accounts_expenses}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data?.accounts_expenses.map((entry, index) => (
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
        </>
      </Card>

      <Divider className="my-12" />

      {/* Transaction Types Section */}
      <div className="mt-12 mb-10 text-center">
        <Title level={3} className="!text-2xl !font-bold !mb-0 text-gray-800">
          إحصائيات أنواع المعاملات
        </Title>
        <p className="text-gray-500 mt-1">المقارنة بين الإيرادات والمصروفات</p>
      </div>

      <Card className="shadow-md rounded-2xl">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data?.transaction_stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="#00C49F"
              name="إجمالي"
              stackId="a"
              isAnimationActive={true}
            >
              {data?.transaction_stats.map((entry, index) => (
                <Cell
                  key={`cell-inc-${index}`}
                  fill={entry.type === "إيراد" ? "#00C49F" : "#FF4D4F"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default FinancialOverview;
