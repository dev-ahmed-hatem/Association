import { Table, DatePicker, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { Employee } from "../../types/employee";

// Sample Employee Data
const employee3: Employee = {
  id: 1,
  url: "http://127.0.0.1:8000/api/employees/employees/1/",
  department: "Social Media",
  gender: "ذكر",
  marital_status: "أعزب",
  mode: "عن بُعد",
  created_by: "Dev Ahmed Hatem",
  name: "Employee 1",
  email: "e@a.com",
  is_active: true,
  phone: "123",
  employee_id: "E12",
  address: "16 moharam bek",
  birth_date: "2000-07-22",
  age: 25,
  national_id: "123123",
  position: "Full Stack Developer",
  hire_date: "2023-12-02",
  cv: "http://127.0.0.1:8000/media/employees/cv/Screenshot_2025-03-18_221316.png",
  image: "http://127.0.0.1:8000/media/employees/images/6mouhk.png",
  created_at: "2025-05-08T14:31:02.935535Z",

  performance: {
    totalProjects: 15,
    activeProjects: 3,
    totalAssignments: 20,
    activeAssignments: 5,
  },

  attendance: [
    { date: "2025-03-10", check_in: "08:30 AM", check_out: "05:00 PM" },
    { date: "2025-03-11", check_in: "09:00 AM", check_out: "04:45 PM" },
    { date: "2025-03-12" }, // No record for this day
    { date: "2025-03-13", check_in: "07:45 AM", check_out: "05:30 PM" },
    { date: "2025-03-14" }, // No record
  ],

  salaryHistory: [
    { date: "2025-01", baseSalary: 15000, bonuses: 2000 },
    { date: "2025-02", baseSalary: 15000, bonuses: 1500 },
    { date: "2025-03", baseSalary: 15000, bonuses: 1800 },
  ],
};

const SubscriptionHistory = () => {
  const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs()); // Default to current year

  // Generate monthly salary data for the selected year
  const getYearSalaryData = () => {
    let yearData = [];

    for (let i = 0; i < 12; i++) {
      const month = selectedYear.startOf("year").add(i, "month");
      const record = employee3.salaryHistory.find((salary) =>
        dayjs(salary.date).isSame(month, "month")
      );

      yearData.push({
        date: month.format("YYYY-MM"),
        baseSalary: record?.baseSalary || "-",
        bonuses: record?.bonuses || "-",
        totalSalary: record ? record.baseSalary + record.bonuses : "-",
      });
    }
    return yearData;
  };

  // Table columns
  const columns: ColumnsType<{
    baseSalary: number | string;
    bonuses: number | string;
    totalSalary: number | string;
    date: string;
  }> = [
    {
      title: "الشهر",
      dataIndex: "date",
      key: "date",
    },
    // {
    //   title: "الشهر",
    //   dataIndex: "date",
    //   key: "date",
    // },
    {
      title: "الراتب الأساسي",
      dataIndex: "baseSalary",
      key: "baseSalary",
      render: (value) => (value !== "-" ? `${value}` : "-"),
      sorter: (a, b) =>
        a?.baseSalary && b?.baseSalary
          ? (a.baseSalary as number) - (b.baseSalary as number)
          : 0,
    },
    {
      title: "المكافآت",
      dataIndex: "bonuses",
      key: "bonuses",
      render: (value) => (value !== "-" ? `${value}` : "-"),
      sorter: (a, b) =>
        a?.bonuses && b?.bonuses
          ? (a.bonuses as number) - (b.bonuses as number)
          : 0,
    },
    {
      title: "إجمالي الراتب",
      dataIndex: "totalSalary",
      key: "totalSalary",
      render: (value) => (value !== "-" ? `${value}` : "-"),
      sorter: (a, b) =>
        a?.totalSalary && b?.totalSalary
          ? (a.totalSalary as number) - (b.totalSalary as number)
          : 0,
    },
  ];

  return (
    <div>
      {/* Year Picker */}
      <Space
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <DatePicker
          picker="year"
          onChange={(date) => setSelectedYear(date || dayjs())}
          format="[السنة ]YYYY"
          placeholder="اختر السنة"
          className="w-full md:w-60"
        />
      </Space>

      {/* Salary Table */}
      <Table
        dataSource={getYearSalaryData()}
        columns={columns}
        rowKey="date"
        pagination={false}
        bordered
        title={() => `سجل الراتب - سنة ${dayjs(selectedYear).format("YYYY")}`}
        scroll={{ x: "max-content" }}
        className="calypso-header"
      />
    </div>
  );
};

export default SubscriptionHistory;
