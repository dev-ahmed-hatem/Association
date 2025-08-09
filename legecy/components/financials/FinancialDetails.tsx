import React from "react";
import { Card, Descriptions, Tag } from "antd";
import { FinancialItem } from "../../types/financial_item";

interface FinancialDetailsProps {
  item: FinancialItem;
}

const FinancialDetails: React.FC<FinancialDetailsProps> = ({ item }) => {
  return (
    <Card className="shadow-md rounded-xl">
      <Descriptions title="تفاصيل العملية المالية" bordered column={1}>
        <Descriptions.Item label="الرمز">{item.id}</Descriptions.Item>
        <Descriptions.Item label="النوع">
          <Tag color={item.type === "income" ? "green" : "red"}>
            {item.type === "income" ? "إيراد" : "مصروف"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="المبلغ">
          {item.amount.toLocaleString()} ج.م
        </Descriptions.Item>
        <Descriptions.Item label="التاريخ">{item.date}</Descriptions.Item>
        <Descriptions.Item label="الفئة">{item.category}</Descriptions.Item>
        {item.description && (
          <Descriptions.Item label="الوصف">
            {item.description}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default FinancialDetails;
