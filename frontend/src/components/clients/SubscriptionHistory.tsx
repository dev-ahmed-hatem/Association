import { Table, DatePicker, Space, Button, InputNumber, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { Employee } from "../../types/employee";
import { Subscription } from "@/types/subscription";

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
    { date: "2025-01", baseSalary: 300, bonuses: 2000 },
    { date: "2025-02", baseSalary: 300, bonuses: 1500 },
    { date: "2025-03", baseSalary: 300, bonuses: 1800 },
  ],
};

const SubscriptionHistory = () => {
  const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs()); // Default to current year

  // Generate monthly salary data for the selected year
  const getYearSalaryData = (): Subscription[] => {
    let yearData: Subscription[] = [];

    const monthCount =
      dayjs().year() === selectedYear.year() ? selectedYear.month() + 1 : 12;

    for (let i = 0; i < monthCount; i++) {
      const month = selectedYear.startOf("year").add(i, "month");

      // yearData.push({
      //   date: month.format("YYYY-MM"),
      //   status: "غير مدفوع",

      // });
    }
    return yearData;
  };

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    getYearSalaryData()
  );

  // mark as paid
  const markAsPaid = (record: Subscription) => {
    setSubscriptions((prev) =>
      prev.map((item) =>
        item.date === record.date ? { ...item, status: "مدفوع" } : item
      )
    );
  };

  // Table columns
  const columns: ColumnsType<Subscription> = [
    {
      title: "الشهر",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "قيمة الاشتراك",
      dataIndex: "baseSalary",
      key: "baseSalary",
      render: (value, record) =>
        record.status === "مدفوع" ? (
          <span>{value}</span>
        ) : (
          <InputNumber value={value} />
        ),
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Tag color={value === "مدفوع" ? "green" : "red"}>{value}</Tag>
      ),
    },
    {
      title: "إجراءات",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          disabled={record.status === "مدفوع"}
          onClick={() => markAsPaid(record)}
        >
          تسجيل كمدفوع
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setSubscriptions(getYearSalaryData());
  }, [selectedYear]);

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
          value={selectedYear}
          format="[السنة ]YYYY"
          placeholder="اختر السنة"
          className="w-full md:w-60"
          disabledDate={(date) => date.year() > dayjs().year()}
        />
      </Space>

      {/* Subscription Table */}
      <Table
        dataSource={subscriptions}
        columns={columns}
        rowKey="date"
        pagination={false}
        bordered
        title={() =>
          `سجل الاشتراكات - سنة ${dayjs(selectedYear).format("YYYY")}`
        }
        scroll={{ x: "max-content" }}
        className="minsk-header"
      />
    </div>
  );
};

export default SubscriptionHistory;
