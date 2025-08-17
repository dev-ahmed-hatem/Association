import { Table, Space, Button, InputNumber, DatePicker, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

type Installment = {
  number: number;
  dueDate: string;
  amount: number;
  status: "مدفوع" | "غير مدفوع";
};

const InstallmentsHistory = () => {
  const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs());
  const fixedInstallments = 6;

  // Example state to store installments
  const [installments, setInstallments] = useState<Installment[]>(() => {
    let data: Installment[] = [];
    for (let i = 1; i <= fixedInstallments; i++) {
      const dueDate = selectedYear.startOf("year").add(i - 1, "month");
      data.push({
        number: i,
        dueDate: dueDate.format("YYYY-MM"),
        amount: 2000,
        status: "غير مدفوع",
      });
    }
    return data;
  });

  // Mark installment as paid
  const markAsPaid = (record: Installment) => {
    setInstallments((prev) =>
      prev.map((item) =>
        item.number === record.number ? { ...item, status: "مدفوع" } : item
      )
    );
  };

  // Table columns
  const columns: ColumnsType<Installment> = [
    {
      title: "رقم القسط",
      dataIndex: "number",
      key: "number",
    },
    {
      title: "تاريخ الاستحقاق",
      dataIndex: "dueDate",
      key: "dueDate",
    },
    {
      title: "قيمة القسط",
      dataIndex: "amount",
      key: "amount",
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

  return (
    <div>
      {/* Installments Table */}
      <Table
        dataSource={installments}
        columns={columns}
        rowKey="number"
        pagination={false}
        bordered
        title={() =>
          `تاريخ الأقساط - سنة ${dayjs(selectedYear).format("YYYY")}`
        }
        scroll={{ x: "max-content" }}
        className="minsk-header"
      />
    </div>
  );
};

export default InstallmentsHistory;
