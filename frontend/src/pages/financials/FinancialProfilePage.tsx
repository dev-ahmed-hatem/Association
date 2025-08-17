import React from "react";
import { Card, Avatar, Tabs, Button, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FinancialRecord } from "../../types/financial_record";
import FinancialDetails from "../../components/financials/FinancialDetails";
import { transactionTypeColors } from "@/types/transaction_type";
import { useParams } from "react-router";
import { useGetFinancialRecordQuery } from "@/app/api/endpoints/financial_records";
import Loading from "@/components/Loading";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "../Error";

const items = (record: FinancialRecord) => [
  {
    label: "تفاصيل العملية",
    key: "1",
    children: <FinancialDetails item={record} />,
  },
];

const FinancialProfilePage: React.FC = () => {
  const { record_id } = useParams();

  const {
    data: record,
    isFetching,
    isError: recordIsError,
    error: recordError,
  } = useGetFinancialRecordQuery({ format: "detailed", id: record_id! });

  if (isFetching) return <Loading />;
  if (recordIsError) {
    const error_title =
      (recordError as axiosBaseQueryError).status === 404
        ? "عملية غير موجودة! تأكد من كود العملية المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }
  return (
    <>
      {/* Header */}
      <Card className="shadow-lg rounded-xl">
        <div className="flex items-center justify-between flex-wrap gap-y-6">
          {/* Avatar */}
          <div className="flex items-center flex-wrap gap-4">
            <Avatar size={80} className="bg-blue-700 font-semibold">
              {record?.id}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {record?.transaction_type.type === "إيراد" ? "إيراد" : "مصروف"}{" "}
                – {record?.transaction_type.name}
              </h2>
              <p className="text-gray-500">
                بتاريخ <span dir="rtl">{record?.date}</span>
              </p>
            </div>
          </div>

          {/* Type Tag */}
          <div className="text-center">
            <Tag
              color={transactionTypeColors[record?.transaction_type.type!]}
              className="text-base w-20 text-center"
            >
              {record?.transaction_type.type === "إيراد" ? "إيراد" : "مصروف"}
            </Tag>
          </div>

          {/* Amount */}
          <div className="text-xl font-bold text-right text-calypso-700">
            {record?.amount.toLocaleString()} ج.م
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        className="mt-4"
        defaultActiveKey="1"
        direction="rtl"
        items={items(record!)}
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
