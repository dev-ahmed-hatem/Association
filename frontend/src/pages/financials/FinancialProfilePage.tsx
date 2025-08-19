import React, { useEffect } from "react";
import { Card, Avatar, Tabs, Button, Tag, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FinancialRecord } from "../../types/financial_record";
import FinancialDetails from "../../components/financials/FinancialDetails";
import {
  TransactionKindEnglish,
  transactionTypeColors,
} from "@/types/transaction_type";
import { useNavigate, useParams } from "react-router";
import {
  useFinancialRecordMutation,
  useGetFinancialRecordQuery,
} from "@/app/api/endpoints/financial_records";
import Loading from "@/components/Loading";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "../Error";
import { useNotification } from "@/providers/NotificationProvider";

const items = (record: FinancialRecord) => [
  {
    label: "تفاصيل العملية",
    key: "1",
    children: <FinancialDetails item={record} />,
  },
];

const FinancialProfilePage: React.FC = () => {
  const { record_id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();

  const {
    data: record,
    isFetching,
    isError: recordIsError,
    error: recordError,
  } = useGetFinancialRecordQuery({ format: "detailed", id: record_id! });

  const [
    deleteRecord,
    { isLoading: deleting, isError: deleteError, isSuccess: deleted },
  ] = useFinancialRecordMutation();

  const handleDelete = () => {
    deleteRecord({
      url: `/financials/financial-records/${record_id}/`,
      method: "DELETE",
    });
  };
  useEffect(() => {
    if (deleteError) {
      notification.error({
        message: "حدث خطأ أثناء حذف العملية ! برجاء إعادة المحاولة",
      });
    }
  }, [deleteError]);

  useEffect(() => {
    if (deleted) {
      notification.success({
        message: "تم حذف العملية بنجاح",
      });
      navigate(
        `/financials/${TransactionKindEnglish[record!.transaction_type.type]}s`
      );
    }
  }, [deleted]);

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

      <div className="flex justify-between mt-2 flex-wrap gap-2">
        {/* Meta Data */}
        <div className="flex gap-1 flex-col text-sm">
          <div>
            <span className="font-medium text-gray-700" dir="rtl">
              تاريخ الإضافة:{" "}
            </span>
            {record!.created_at}
          </div>
          <div>
            <span className="font-medium text-gray-700">بواسطة: </span>
            {record!.created_by || "غير مسجل"}
          </div>
        </div>

        {/* Action Button */}
        {record?.transaction_type.system_related ? (
          <span>
            <Tag color="blue" className="text-base px-2">تمت الإضافة تلقائيًا</Tag>
          </span>
        ) : (
          <div className="btn-wrapper flex md:justify-end mt-4 flex-wrap gap-4">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                navigate(
                  `/financials/${
                    TransactionKindEnglish[record!.transaction_type.type]
                  }s/edit/${record?.id}`
                );
              }}
            >
              تعديل العملية
            </Button>
            <Popconfirm
              title="هل أنت متأكد من حذف هذه العملية؟"
              onConfirm={handleDelete}
              okText="نعم"
              cancelText="لا"
            >
              <Button
                className="enabled:bg-red-500 enabled:border-red-500 enabled:shadow-[0_2px_0_rgba(0,58,58,0.31)]
                  enabled:hover:border-red-400 enabled:hover:bg-red-400 enabled:text-white"
                icon={<DeleteOutlined />}
                loading={deleting}
              >
                حذف العملية
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </>
  );
};

export default FinancialProfilePage;
