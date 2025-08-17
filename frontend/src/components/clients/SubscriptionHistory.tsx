import { Table, DatePicker, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { Employee } from "../../types/employee";

const SalaryHistory = ({
  salaryHistory,
}: {
  salaryHistory: Employee["salaryHistory"];
}) => {
  const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs()); // Default to current year

  // Generate monthly salary data for the selected year
  const getYearSalaryData = () => {
    let yearData = [];

    for (let i = 0; i < 12; i++) {
      const month = selectedYear.startOf("year").add(i, "month");
      const record = salaryHistory.find((salary) =>
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

export default SalaryHistory;
