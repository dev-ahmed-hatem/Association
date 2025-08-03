import { useState } from "react";
import { Table, Input, DatePicker, Statistic } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Link, Outlet, useMatch, useNavigate } from "react-router";
import type { FinancialItem } from "../../types/financial_item";
import { tablePaginationConfig } from "../../utils/antd";
import { ColumnsType } from "antd/es/table";

export const data: FinancialItem[] = [
  {
    id: "inc-1",
    type: "income",
    date: "2025-04-08",
    category: "مبيعات",
    description: "دفعة من العميل أحمد",
    amount: 1500,
  },
  {
    id: "inc-2",
    type: "income",
    date: "2025-04-07",
    category: "خدمة صيانة",
    description: "صيانة أجهزة كمبيوتر",
    amount: 800,
  },
  {
    id: "inc-3",
    type: "income",
    date: "2025-04-08",
    category: "تدريب",
    description: "دورة تدريبية لفريق خارجي",
    amount: 1200,
  },
  {
    id: "inc-4",
    type: "income",
    date: "2025-05-04",
    category: "مبيعات",
    description: "بيع معدات مكتبية",
    amount: 600,
  },
  {
    id: "exp-1",
    type: "expense",
    date: "2025-04-08",
    category: "إيجار",
    description: "إيجار المكتب الشهري",
    amount: 2500,
  },
  {
    id: "exp-2",
    type: "expense",
    date: "2025-04-07",
    category: "أدوات مكتبية",
    description: "شراء أوراق وأقلام",
    amount: 200,
  },
  {
    id: "exp-3",
    type: "expense",
    date: "2025-05-04",
    category: "صيانة",
    description: "صيانة التكييف",
    amount: 400,
  },
  {
    id: "exp-4",
    type: "expense",
    date: "2025-04-08",
    category: "مصاريف نقل",
    description: "شحن بضائع للفرع الجديد",
    amount: 950,
  },
];

type Props = {
  financialItem: "income" | "expense";
};

const FinancialRecords: React.FC<Props> = ({ financialItem }) => {
  const isFinancials = useMatch(`/financials/${financialItem}s`);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const navigate = useNavigate();

  const pageTitle = financialItem === "income" ? "الإيرادات" : "المصروفات";
  const addButtonLabel =
    financialItem === "income" ? "إضافة إيراد" : "إضافة مصروف";

  const filteredData = data.filter(
    (item) =>
      item.date === selectedDate &&
      item.description?.includes(searchText) &&
      item.type === financialItem
  );

  const columns: ColumnsType<FinancialItem> = [
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "الفئة",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "الوصف",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "القيمة",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => (
        <Statistic
          value={value}
          suffix="ج.م"
          valueStyle={{
            color: financialItem === "income" ? "#3f8600" : "#cf1322",
            fontSize: "16px",
          }}
        />
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
  ];

  if (!isFinancials) return <Outlet />;
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">{pageTitle}</h1>

      <div className="flex justify-between flex-wrap gap-2 mb-4">
        <Input
          placeholder={`ابحث عن ${pageTitle}...`}
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          className="mb-4 w-full max-w-sm h-10"
        />

        <Link
          to={"add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
         bg-green-700 hover:bg-green-600 shadow-[0_2px_0_rgba(0,58,58,0.31)]"
        >
          <PlusOutlined />
          {addButtonLabel}
        </Link>
      </div>
      <div className="flex justify-between flex-wrap gap-2">
        <DatePicker
          onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || "")}
          value={dayjs(selectedDate)}
          format="YYYY-MM-DD"
          className="mb-4 h-10 w-full max-w-sm"
          placeholder="اختر التاريخ"
          suffixIcon={<CalendarOutlined />}
          allowClear={false}
        />
      </div>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={tablePaginationConfig()}
        bordered
        scroll={{ x: "max-content" }}
        className="clickable-table black-header"
        onRow={(record) => ({
          onClick: () => navigate(`/financials/${financialItem}s/${record.id}`),
        })}
      />
    </>
  );
};

export default FinancialRecords;
