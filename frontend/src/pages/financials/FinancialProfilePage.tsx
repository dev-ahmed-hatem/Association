import React from "react";
import { Card, Avatar, Tabs, Button, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FinancialItem } from "../../types/financial_item";
import FinancialDetails from "../../components/financials/FinancialDetails";
import { getInitials } from "../../utils";

const financialItem: FinancialItem = {
  id: "f001",
  type: "income",
  amount: 2500,
  date: "2025-04-08",
  category: "مبيعات",
  description: "دفعة أولى من العميل X مقابل الخدمة.",
};

const FinancialProfilePage: React.FC = () => {
  const typeColors: Record<FinancialItem["type"], string> = {
    income: "green",
    expense: "red",
  };

  const items = [
    {
      label: "تفاصيل العملية",
      key: "1",
      children: <FinancialDetails item={financialItem} />,
    },
  ];

  return (
    <>
      {/* Header */}
      <Card className="shadow-lg rounded-xl">
        <div className="flex items-center justify-between flex-wrap gap-y-6">
          {/* Avatar */}
          <div className="flex items-center flex-wrap gap-4">
            <Avatar size={80} className="bg-blue-700 font-semibold">
              {getInitials(financialItem.category)}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {financialItem.type === "income" ? "إيراد" : "مصروف"} –{" "}
                {financialItem.category}
              </h2>
              <p className="text-gray-500">بتاريخ {financialItem.date}</p>
            </div>
          </div>

          {/* Type Tag */}
          <div className="text-center">
            <Tag color={typeColors[financialItem.type]}>
              {financialItem.type === "income" ? "إيراد" : "مصروف"}
            </Tag>
          </div>

          {/* Amount */}
          <div className="text-xl font-bold text-right text-calypso-700">
            {financialItem.amount.toLocaleString()} ج.م
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        className="mt-4"
        defaultActiveKey="1"
        direction="rtl"
        items={items}
      />

      {/* Actions */}
      <div className="flex md:justify-end mt-4 flex-wrap gap-4">
        <Button type="primary" icon={<EditOutlined />}>
          تعديل العملية
        </Button>
        <Button
          className="enabled:bg-red-500 enabled:border-red-500 enabled:shadow-[0_2px_0_rgba(0,58,58,0.31)]
              enabled:hover:border-red-400 enabled:hover:bg-red-400 enabled:text-white"
          icon={<DeleteOutlined />}
        >
          حذف العملية
        </Button>
      </div>
    </>
  );
};

export default FinancialProfilePage;
