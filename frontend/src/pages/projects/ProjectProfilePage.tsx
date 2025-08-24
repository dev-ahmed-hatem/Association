import React, { ReactNode, useState } from "react";
import { Card, Table, Tag, Button, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

type Transaction = {
  key: string;
  value: number;
  description: ReactNode;
  date: string;
};

const { Option } = Select;

const incomeData: Transaction[] = [
  { key: "1", value: 1500, description: "دفعة أولى", date: "2025-01-15" },
  { key: "2", value: 2000, description: "دفعة ثانية", date: "2025-02-01" },
];

const expenseData: Transaction[] = [
  { key: "1", value: 500, description: "شراء مواد", date: "2025-01-20" },
  { key: "2", value: 700, description: "أجور عمال", date: "2025-02-05" },
];

const ProjectProfilePage: React.FC = () => {
  const [status, setStatus] = useState("قيد التنفيذ");

  const columns = [
    { title: "البيان", dataIndex: "description", key: "description" },
    {
      title: "القيمة",
      dataIndex: "value",
      key: "value",
      // render: (v: number) => `${v} ج.م`,
    },
    { title: "التاريخ", dataIndex: "date", key: "date" },
  ];

  const totalRow = (data: Transaction[]) => [
    {
      key: "total",
      value: data.reduce((sum, item) => sum + item.value, 0),
      description: <strong>الإجمالي</strong>,
      date: "",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Project Info */}
      <Card className="shadow-md rounded-2xl bg-gradient-to-l from-[#3F3D56] to-indigo-700 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 p-4">
          {/* Project Name */}
          <div>
            <h2 className="text-2xl font-bold">اسم المشروع </h2>
            <p className="text-gray-200 mt-1">تاريخ البدء: 2025-01-10</p>
          </div>

          {/* Project Status */}
          <div className="flex flex-col items-center md:items-end gap-2 justify-center">
            <Tag
              color={status === "قيد التنفيذ" ? "blue" : "green"}
              className="px-3 py-1 text-base rounded-xl"
            >
              {status}
            </Tag>
            {/* <Select
              value={status}
              onChange={(val) => setStatus(val)}
              className="w-40"
            >
              <Option value="قيد التنفيذ">قيد التنفيذ</Option>
              <Option value="منتهي">منتهي</Option>
            </Select> */}
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incomes */}
        <Card
          title={
            <div className="flex justify-between items-center bg-gradient-to-r from-green-400 to-green-600 text-white p-3">
              <span className="font-semibold">الإيرادات</span>
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة
              </Button>
            </div>
          }
          variant="borderless"
          className="shadow-lg rounded-2xl"
          styles={{
            header: {
              padding: 0,
              borderRadius: "",
            },
          }}
        >
          <Table
            dataSource={[...incomeData, ...totalRow(incomeData)]}
            columns={columns}
            rowKey="id"
            pagination={false}
            rowClassName={(record) =>
              record.key === "total" ? "bg-green-50 font-semibold" : ""
            }
          />
        </Card>

        {/* Expenses */}
        <Card
          title={
            <div className="flex justify-between items-center bg-gradient-to-r from-red-400 to-red-600 text-white p-3">
              <span className="font-semibold">المصروفات</span>
              <Button type="primary" icon={<PlusOutlined />}>
                إضافة
              </Button>
            </div>
          }
          variant="borderless"
          className="shadow-lg rounded-2xl"
          styles={{
            header: {
              padding: 0,
              borderRadius: "",
            },
          }}
        >
          <Table
            dataSource={[...expenseData, ...totalRow(expenseData)]}
            columns={columns}
            rowKey="id"
            pagination={false}
            rowClassName={(record) =>
              record.key === "total" ? "bg-red-50 font-semibold" : ""
            }
          />
        </Card>
      </div>
    </div>
  );
};

export default ProjectProfilePage;
