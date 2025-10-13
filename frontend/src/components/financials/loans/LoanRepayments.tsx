import {
  Table,
  Space,
  Button,
  InputNumber,
  Tag,
  Input,
  Popconfirm,
} from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNotification } from "@/providers/NotificationProvider";
import { Link } from "react-router";
import Loading from "@/components/Loading";
import { textify } from "@/utils";
import {
  useGetRepaymentsQuery,
  useRepaymentMutation,
} from "@/app/api/endpoints/repayments";
import { Repayment } from "@/types/repayment";
import { usePermission } from "@/providers/PermissionProvider";

const LoanRepaymentHistory = ({
  loan_id,
  is_active,
}: {
  loan_id: string;
  is_active: boolean;
}) => {
  const { can } = usePermission();
  const notification = useNotification();
  const [message, setMessage] = useState<string | null>(null);

  const {
    data: repayments,
    isFetching,
    isError,
    isSuccess,
  } = useGetRepaymentsQuery({ loan_id });

  const [
    handleRepayment,
    { isLoading, isError: recordError, isSuccess: recorded },
  ] = useRepaymentMutation();

  const [repaymentsList, setRepaymentsList] = useState<Repayment[]>([]);

  // mark as paid
  const markAsPaid = (record: Repayment) => {
    const data = {
      amount: record.amount,
      paid_at: dayjs().format("YYYY-MM-DD"),
      notes: record.notes,
      loan: parseInt(loan_id),
    };
    setMessage("تم تسجيل الدفعة");
    handleRepayment({
      url: `/financials/repayments/${record.id}/payment/`,
      method: "PATCH",
      data,
    });
  };

  // edit local state
  const editRecord = (
    record: Repayment,
    field: "notes" | "amount",
    value: any
  ) => {
    setRepaymentsList((prev) =>
      prev.map((item) =>
        item.id === record.id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setMessage("تم إلغاء الدفعة");
    handleRepayment({
      url: `/financials/repayments/${id}/revoke/`,
      method: "PATCH",
      data: { loan: parseInt(loan_id) },
    });
  };

  // Table columns
  const columns: ColumnsType<Repayment> = [
    {
      title: "رقم الدفعة",
      dataIndex: "repayment_number",
      key: "repayment_number",
    },
    {
      title: "المبلغ",
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
      title: "تاريخ الاستحقاق",
      dataIndex: "due_date",
      key: "due_date",
      render: (value: string) => (
        <span className="text-minsk font-bold">{value}</span>
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
            {can("incomes.view") && (
              <Link to={`/financials/incomes/${record.financial_record}/`}>
                <Button
                  type="primary"
                  size="middle"
                  icon={<EyeOutlined />}
                  title="عرض"
                  disabled={isLoading}
                />
              </Link>
            )}

            {can("loans.deleteRepayment") && (
              <Popconfirm
                title="تأكيد الإلغاء"
                description="هل أنت متأكد أنك تريد إلغاء هذه الدفعة؟"
                okText="نعم"
                cancelText="إلغاء"
                onConfirm={() => handleDelete(record.id.toString())}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="middle"
                  className="hover:bg-red-600 hover:border-red-600 hover:text-white"
                  title="إلغاء"
                  disabled={isLoading}
                />
              </Popconfirm>
            )}
          </Space>
        ) : (
          <>
            {can("loans.addRepayment") && (
              <>
                {is_active ? (
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
                ) : (
                  <Tag color="red">عضو متقاعد</Tag>
                )}
              </>
            )}
          </>
        ),
    },
  ];

  useEffect(() => {
    if (repayments) setRepaymentsList(repayments);
  }, [repayments]);

  useEffect(() => {
    if (recorded) {
      notification.success({
        message: message ?? "تم التنفيذ",
      });
    }
  }, [recorded]);

  useEffect(() => {
    if (recordError) {
      notification.error({
        message: "حدث خطأ أثناء التنفيذ ! برجاء إعادة المحاولة",
      });
    }
  }, [recordError]);

  useEffect(() => {
    if (isError) {
      notification.error({
        message: "حدث خطأ أثناء تحميل البيانات ! برجاء إعادة المحاولة",
      });
    }
  }, [isError]);

  return (
    <div>
      {isFetching && <Loading />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-lg font-semibold text-red-600">حدث خطأ</p>
          <p className="text-gray-500 text-sm">يرجى إعادة المحاولة لاحقًا</p>
        </div>
      )}

      {isSuccess && repaymentsList && (
        <Table
          dataSource={repaymentsList}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          title={() => `سجل الدفعات`}
          scroll={{ x: "max-content" }}
          className="minsk-header"
        />
      )}
    </div>
  );
};

export default LoanRepaymentHistory;
