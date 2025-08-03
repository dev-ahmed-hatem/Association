import React, { useState } from "react";
import {
  Table,
  DatePicker,
  Select,
  Button,
  Card,
  Typography,
  Input,
} from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Outlet, useMatch, useNavigate } from "react-router";
import { ColumnType } from "antd/lib/table";
import { tablePaginationConfig } from "../../utils/antd";

type SalaryRecord = {
  id: string;
  name: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  workingHours: number;
  overtimeHours: number;
  vacations?: number;
  lateMinutes?: number;
  notes?: string;
};

const initialData: SalaryRecord[] = [
  {
    id: "E001",
    name: "أحمد علي",
    baseSalary: 5000,
    bonus: 300,
    deductions: 100,
    workingHours: 160,
    overtimeHours: 10,
    vacations: 2,
    lateMinutes: 45,
    notes: "لا يوجد",
  },
  {
    id: "E002",
    name: "سارة يوسف",
    baseSalary: 4800,
    bonus: 200,
    deductions: 0,
    workingHours: 158,
    overtimeHours: 5,
    vacations: 1,
    lateMinutes: 20,
    notes: "تمت إضافة مكافأة استثنائية",
  },
];

const SalariesPage: React.FC = () => {
  const isSalaries = useMatch("/financials/salaries");
  const [salaryData, setSalaryData] = useState(initialData);
  const [month, setMonth] = useState(dayjs());
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const filteredData = salaryData.filter((record) =>
    record.name.includes(searchText)
  );

  const columns: ColumnType<SalaryRecord>[] = [
    {
      title: "الموظف",
      dataIndex: "name",
      key: "name",
      sorter: (a: SalaryRecord, b: SalaryRecord) =>
        a.name.localeCompare(b.name),
    },
    {
      title: "الراتب الأساسي",
      dataIndex: "baseSalary",
      key: "baseSalary",
      sorter: (a, b) => a.baseSalary - b.baseSalary,
      render: (text: number) => `${text.toLocaleString()} ج.م`,
    },
    {
      title: "الساعات الأساسية",
      dataIndex: "workingHours",
      key: "workingHours",
      sorter: (a, b) => a.workingHours - b.workingHours,
    },
    {
      title: "الساعات الإضافية",
      dataIndex: "overtimeHours",
      key: "overtimeHours",
      sorter: (a, b) => a.overtimeHours - b.overtimeHours,
    },
    {
      title: "المكافآت",
      dataIndex: "bonus",
      key: "bonus",
      sorter: (a, b) => a.bonus - b.bonus,
    },
    {
      title: "الخصومات",
      dataIndex: "deductions",
      key: "deductions",
      sorter: (a, b) => a.deductions - b.deductions,
    },
    {
      title: "الصافي",
      key: "net",
      sorter: (a, b) =>
        a.baseSalary +
        a.bonus +
        a.overtimeHours * 25 -
        a.deductions -
        (b.baseSalary + b.bonus + b.overtimeHours * 25 - b.deductions),
      render: (_: any, record: SalaryRecord) => {
        const overtimePay = record.overtimeHours * 25;
        const total =
          record.baseSalary + record.bonus + overtimePay - record.deductions;
        return (
          <span className="font-bold text-green-600">
            {total.toLocaleString()} ج.م
          </span>
        );
      },
    },
  ];

  const expandedRowRender = (record: SalaryRecord) => (
    <div className="text-right text-sm space-y-2 px-4 py-2">
      <p>عدد الإجازات: {record.vacations} أيام</p>
      <p>
        إجمالي التأخيرات: {record.lateMinutes} دقيقة (=
        {Math.floor((record.lateMinutes || 0) / 60)} ساعة)
      </p>
      <p>ملاحظات: {record.notes}</p>
    </div>
  );

  if (!isSalaries) return <Outlet />;
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">الرواتب الشهرية</h1>

      {/* Filter */}
      <Card className="shadow-sm mb-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <label className="font-semibold whitespace-nowrap">
              اختر الشهر:
            </label>
            <DatePicker
              picker="month"
              value={month}
              onChange={(val) => val && setMonth(val)}
              className="w-full md:w-48"
            />
          </div>

          <Button
            icon={<DownloadOutlined />}
            className="bg-blue-600 text-white hover:bg-blue-500"
          >
            تصدير البيانات
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="flex justify-between flex-wrap gap-2 mb-4">
          <Input
            placeholder="بحث عن موظف ..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full max-w-sm h-10"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          expandable={{ expandedRowRender }}
          pagination={tablePaginationConfig()}
          scroll={{ x: "max-content" }}
          className="rtl text-right cursor-pointer"
          onRow={(record) => ({
            onClick: () => navigate(`edit?employee=${record.name}`),
          })}
        />
      </Card>
    </>
  );
};

export default SalariesPage;
