import React from "react";
import { Card, Descriptions, Tag } from "antd";
import {
  FinancialRecord,
  paymentMethodColors,
  receiptPaymentMethods,
} from "@/types/financial_record";
import { transactionTypeColors } from "@/types/transaction_type";
import { textify } from "@/utils";

interface FinancialDetailsProps {
  item: FinancialRecord;
}

const FinancialDetails: React.FC<FinancialDetailsProps> = ({ item }) => {
  return (
    <Card className="shadow-md rounded-xl">
      <Descriptions title="تفاصيل العملية المالية" bordered column={1}>
        <Descriptions.Item label="رقم العملية">{item.id}</Descriptions.Item>
        <Descriptions.Item label="النوع">
          <Tag color={transactionTypeColors[item.transaction_type.type]}>
            {item.transaction_type.type === "إيراد" ? "إيراد" : "مصروف"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="المبلغ">
          {item.amount.toLocaleString()} ج.م
        </Descriptions.Item>
        <Descriptions.Item label="التاريخ">{item.date}</Descriptions.Item>
        <Descriptions.Item label="الفئة">
          {item.transaction_type.name}
        </Descriptions.Item>
        <Descriptions.Item label="طريقة الدفع">
          <Tag
            className="text-base"
            color={paymentMethodColors[item.payment_method]}
          >
            {item.payment_method}
          </Tag>
        </Descriptions.Item>
        {receiptPaymentMethods.includes(item.payment_method) && (
          <>
            <Descriptions.Item label="البنك">
              {item.bank_account?.name}
            </Descriptions.Item>
            <Descriptions.Item
              label={`رقم ${
                item.payment_method === "شيك" ? "الشيك" : "الإيصال"
              }`}
            >
              {item.receipt_number}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="الملاحظات">
          {textify(item.notes) ?? (
            <Tag className="text-base">لا توجد ملاحظات</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default FinancialDetails;
