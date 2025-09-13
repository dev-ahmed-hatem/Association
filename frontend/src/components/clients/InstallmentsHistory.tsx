import {
  useGetInstallmentsQuery,
  useInstallmentMutation,
} from "@/app/api/endpoints/installments";
import { Installment } from "@/types/installment";
import { textify } from "@/utils";
import {
  Table,
  Button,
  InputNumber,
  Tag,
  Popconfirm,
  Input,
  Empty,
  Card,
  Space,
} from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import Loading from "../Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { Link } from "react-router";
import { dayjs } from "@/utils/locale";
import { Client } from "@/types/client";

const InstallmentsHistory = ({
  client_id,
  subscription_fee,
  prepaid,
}: {
  client_id: string;
  subscription_fee: number;
  prepaid: Client["prepaid"];
}) => {
  const notification = useNotification();

  const [installments, setInstallments] = useState<Installment[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const {
    data: installmentsOriginal,
    isFetching,
    isError,
    isSuccess,
  } = useGetInstallmentsQuery({
    client: client_id,
  });
  const [
    handleInstallment,
    { isLoading, isError: installmentError, isSuccess: installmentSuccess },
  ] = useInstallmentMutation();

  // Mark installment as paid
  const markAsPaid = (record: Installment & { notes?: string }) => {
    const data = {
      paid_at: dayjs().format("YYYY-MM-DD"),
      amount: record.amount,
      notes: record.notes,
    };

    setMessage("تم تسجيل القسط");
    handleInstallment({
      data,
      url: `/financials/installments/${record.id}/payment/`,
      method: "PATCH",
    });
  };

  const editRecord = (
    record: Installment,
    field: "notes" | "amount",
    value: any
  ) => {
    setInstallments((prev) =>
      prev.map((item) =>
        item.id === record.id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRevoke = (id: number) => {
    setMessage("تم إلغاء الدفع");
    handleInstallment({
      url: `/financials/installments/${id}/revoke/`,
      method: "PATCH",
    });
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
          <InputNumber
            value={value}
            onChange={(value) => editRecord(record, "amount", value)}
          />
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
            onChange={(event) =>
              editRecord(record, "notes", event.target.value)
            }
          />
        ),
    },
    {
      title: "تاريخ الدفع",
      dataIndex: "paid_at",
      key: "paid_at",
      render: (value?: string) => (
        <span className="text-minsk font-bold">{value ?? "-"}</span>
      ),
    },
    {
      title: "إجراءات",
      key: "actions",
      render: (_, record) =>
        record.status === "مدفوع" ? (
          <Space>
            <Link to={`/financials/incomes/${record.financial_record}/`}>
              <Button
                type="primary"
                size="middle"
                icon={<EyeOutlined />}
                title="عرض"
                disabled={isLoading}
              />
            </Link>

            <Popconfirm
              title="تأكيد الحذف"
              description="هل أنت متأكد أنك تريد حذف هذا السجل؟"
              okText="نعم"
              cancelText="إلغاء"
              onConfirm={() => handleRevoke(record.id)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="middle"
                className="hover:bg-red-600 hover:border-red-600 hover:text-white"
                title="حذف"
                disabled={isLoading}
              />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="تأكيد الدفع"
            description="تأكيد الدفع بتاريخ اليوم؟"
            okText="تأكيد"
            cancelText="إلغاء"
            placement="top"
            onConfirm={() => markAsPaid(record)}
            disabled={isLoading}
          >
            <Button type="primary" loading={isLoading}>
              تسجيل كمدفوع
            </Button>
          </Popconfirm>
        ),
    },
    // {
    //   title: "إجراءات",
    //   key: "actions",
    //   render: (_, record) =>
    //     record.status === "مدفوع" ? (
    //       <Link
    //         to={`/financials/incomes/${record.financial_record}/`}
    //         className="text-minsk hover:text-minsk-800 hover:underline cursor-pointer font-bold"
    //       >
    //         تم التسجيل {record.paid_at}
    //       </Link>
    //     ) : (
    //       <Popconfirm
    //         title="تأكيد الدفع"
    //         description="تأكيد الدفع بتاريخ اليوم؟"
    //         okText="تأكيد"
    //         cancelText="إلغاء"
    //         placement="top"
    //         onConfirm={() => markAsPaid(record)}
    //         disabled={isLoading}
    //       >
    //         <Button type="primary" loading={isLoading}>
    //           تسجيل كمدفوع
    //         </Button>
    //       </Popconfirm>
    //     ),
    // },
  ];

  useEffect(() => {
    if (installmentsOriginal) setInstallments(installmentsOriginal);
  }, [installmentsOriginal]);

  useEffect(() => {
    if (installmentSuccess) {
      notification.success({
        message: message ?? "تم التنفيذ",
      });
    }
  }, [installmentSuccess]);

  useEffect(() => {
    if (installmentError) {
      notification.error({
        message: "حدث خطأ أثناء التنفيذ ! برجاء إعادة المحاولة",
      });
    }
  }, [installmentError]);

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
        className="rounded-2xl shadow-md bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 mb-5"
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
            {prepaid ? (
              <Link to={`/financials/incomes/${prepaid.financial_record}`}>
                <span className="text-xl font-bold text-green-600 hover:text-green-500 cursor-pointer hover:underline">
                  {prepaid.amount.toLocaleString()} ج.م
                </span>
              </Link>
            ) : (
              <span className="text-xl font-bold text-green-600">غير مسجل</span>
            )}
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
