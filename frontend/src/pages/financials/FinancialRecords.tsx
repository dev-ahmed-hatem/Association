import { useState } from "react";
import { Table, Input, DatePicker, Statistic } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Link, Outlet, useMatch, useNavigate } from "react-router";
import { FinancialRecord } from "@/types/financial_item";
import { tablePaginationConfig } from "../../utils/antd";
import { ColumnsType } from "antd/es/table";
import {
  TransactionKindEnglish,
  TransactionType,
} from "@/types/transaction_type";
import { BankAccount } from "@/types/bank_account";

export const bankAccounts: BankAccount[] = [
  { id: "1", name: "بنك مصر" },
  { id: "2", name: "البنك الأهلي" },
  { id: "3", name: "CIB" },
];

// Example Transaction Types
export const transactionTypes: TransactionType[] = [
  { id: "1", name: "إيجار مقر", type: "مصروف" },
  { id: "2", name: "رسوم اشتراك", type: "إيراد" },
  { id: "3", name: "قرض بنكي", type: "إيراد" },
  { id: "4", name: "مصاريف إدارية", type: "مصروف" },
];

export const data: FinancialRecord[] = [
  {
    id: "1",
    amount: 1500,
    transaction_type: transactionTypes[1],
    date: "2025-08-17",
    payment_method: "نقدي",
    bank_account: null,
    receipt_number: null,
    notes: "دفعة نقدية من أحد الأعضاء",
    created_at: "2025-08-17",
    created_by: 1,
  },
  {
    id: "2",
    amount: 2500,
    transaction_type: transactionTypes[0],
    date: "2025-08-17",
    payment_method: "إيصال بنكي",
    bank_account: bankAccounts[0],
    receipt_number: "RCPT-2025-001",
    notes: "إيجار المقر الشهري",
    created_at: "2025-08-17",
    created_by: 2,
  },
  {
    id: "3",
    amount: 5000,
    transaction_type: transactionTypes[1],
    date: "2025-08-17",
    payment_method: "إيصال بنكي",
    bank_account: bankAccounts[1],
    receipt_number: "RCPT-2025-002",
    notes: "رسوم اشتراك سنوي",
    created_at: "2025-08-17",
    created_by: 3,
  },
  {
    id: "4",
    amount: 1200,
    transaction_type: transactionTypes[3],
    date: "2025-08-17",
    payment_method: "نقدي",
    bank_account: null,
    receipt_number: null,
    notes: "مصاريف مكتبية",
    created_at: "2025-08-17",
    created_by: 1,
  },
  {
    id: "5",
    amount: 10000,
    transaction_type: transactionTypes[1],
    date: "2025-08-17",
    payment_method: "إيصال بنكي",
    bank_account: bankAccounts[2],
    receipt_number: "RCPT-2025-003",
    notes: "قرض من CIB",
    created_at: "2025-08-17",
    created_by: 2,
  },
];

type Props = {
  financialType: "income" | "expense";
};

const FinancialRecords: React.FC<Props> = ({ financialType }) => {
  const isFinancials = useMatch(`/financials/${financialType}s`);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const navigate = useNavigate();

  const pageTitle = financialType === "income" ? "الإيرادات" : "المصروفات";
  const addButtonLabel =
    financialType === "income" ? "إضافة إيراد" : "إضافة مصروف";

  const filteredData = data.filter(
    (item) =>
      item.date === selectedDate &&
      item.transaction_type.type === TransactionKindEnglish[financialType]
  );

  const columns: ColumnsType<FinancialRecord> = [
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "الفئة",
      dataIndex: "type",
      key: "type",
      render: (text, record) => record.transaction_type.name,
    },
    {
      title: "طريقة الدفع",
      dataIndex: "payment_method",
      key: "payment_method",
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
            color: financialType === "income" ? "#3f8600" : "#cf1322",
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

      <div className="flex justify-end flex-wrap gap-2 mb-4">
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
        className="clickable-table minsk-header"
        onRow={(record) => ({
          onClick: () => navigate(`/financials/${financialType}s/${record.id}`),
        })}
      />
    </>
  );
};

export default FinancialRecords;
