import { useGetInstallmentsQuery } from "@/app/api/endpoints/installments";
import { Installment } from "@/types/installment";
import { textify } from "@/utils";
import {
  Table,
  Space,
  Button,
  InputNumber,
  DatePicker,
  Tag,
  Popconfirm,
  Input,
  Empty,
  Card,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import Loading from "../Loading";
import { useNotification } from "@/providers/NotificationProvider";

const InstallmentsHistory = ({
  client_id,
  subscription_fee,
  paid_amount,
}: {
  client_id: string;
  subscription_fee: number;
  paid_amount: number;
}) => {
  const notification = useNotification();

  const {
    data: installments,
    isFetching,
    isError,
    isSuccess,
  } = useGetInstallmentsQuery({
    client: client_id,
  });

  // Mark installment as paid
  const markAsPaid = (record: Installment) => {
    // setInstallments((prev) =>
    //   prev.map((item) =>
    //     item.number === record.number ? { ...item, status: "مدفوع" } : item
    //   )
    // );
  };

  // Table columns
  const columns: ColumnsType<Installment> = [
    {
      title: "رقم القسط",
      dataIndex: "installment_number",
      key: "installment_number",
    },
    {
      title: "تاريخ الاستحقاق",
      dataIndex: "due_date",
      key: "due_date",
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
      title: "ملاحظات",
      dataIndex: "notes",
      key: "notes",
      render: (value, record) =>
        record.status === "مدفوع" ? (
          <span>{textify(value) ?? "-"}</span>
        ) : (
          <Input
            value={value}
            onChange={
              (event) => null
              // editRecord(record, "notes", event.target.value)
            }
          />
        ),
    },
    {
      title: "إجراءات",
      key: "actions",
      render: (_, record) =>
        record.status === "مدفوع" ? (
          <span className="text-minsk font-bold">تم التسجيل</span>
        ) : (
          <Popconfirm
            title="تأكيد الدفع"
            description="تأكيد الدفع بتاريخ اليوم؟"
            okText="تأكيد"
            cancelText="إلغاء"
            placement="top"
            onConfirm={() => markAsPaid(record)}
            // disabled={isLoading}
          >
            <Button type="primary" loading={false}>
              تسجيل كمدفوع
            </Button>
          </Popconfirm>
        ),
    },
  ];

  // useEffect(() => {
  //   if (recorded) {
  //     notification.success({
  //       message: "تم تسجيل الاشتراك",
  //     });
  //   }
  // }, [recorded]);

  // useEffect(() => {
  //   if (recordError) {
  //     notification.error({
  //       message: "حدث خطأ أثناء تسجيل الاشتراك ! برجاء إعادة المحاولة",
  //     });
  //   }
  // }, [recordError]);

  useEffect(() => {
    if (isError) {
      notification.error({
        message: "حدث خطأ أثناء تحميل البيانات ! برجاء إعادة المحاولة",
      });
    }
  }, [isError]);

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-red-500 text-2xl mb-2">⚠️</div>
        <p className="text-lg font-semibold text-red-600">حدث خطأ</p>
        <p className="text-gray-500 text-sm">يرجى إعادة المحاولة لاحقًا</p>
      </div>
    );

  return (
    <div>
      <Card
        className="rounded-2xl shadow-md bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50"
        styles={{ body: { padding: "1.5rem" } }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
          {/* Subscription Fee */}
          <div className="flex flex-col">
            <span className="text-gray-500 font-medium mb-1">
              رسوم العضوية:
            </span>
            <span className="text-xl font-bold text-indigo-600">
              {subscription_fee.toLocaleString()} ج.م
            </span>
          </div>

          {/* Paid Amount */}
          <div className="flex flex-col">
            <span className="text-gray-500 font-medium mb-1">
              المدفوع مقدما:
            </span>
            <span className="text-xl font-bold text-green-600">
              {paid_amount.toLocaleString()} ج.م
            </span>
          </div>
        </div>
      </Card>

      {isFetching && <Loading />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-lg font-semibold text-red-600">حدث خطأ</p>
          <p className="text-gray-500 text-sm">يرجى إعادة المحاولة لاحقًا</p>
        </div>
      )}

      {/* Installments Table */}
      {isSuccess && installments.length > 0 ? (
        <Table
          dataSource={installments}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          title={() => `أقساط العضوية`}
          scroll={{ x: "max-content" }}
          className="minsk-header"
        />
      ) : (
        <div className="flex justify-center items-center py-10">
          <Empty description="لا توجد أقساط" />
        </div>
      )}
    </div>
  );
};

export default InstallmentsHistory;
