import { useEffect, useState } from "react";
import { Button, Table, Popconfirm, Card, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TransactionTypeForm from "./TransactionTypeFrom";
import ErrorPage from "@/pages/Error";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import {
  useGetTransactionTypesQuery,
  useTransactionTypeMutation,
} from "@/app/api/endpoints/transaction_types";
import {
  TransactionKind,
  TransactionType,
  transactionTypeColors,
} from "@/types/transaction_type";

const TransactionTypeManager = () => {
  const notification = useNotification();
  const [editingTransaction, setEditingaccount] =
    useState<TransactionType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>("");

  const {
    data: transactions,
    isFetching,
    isError,
  } = useGetTransactionTypesQuery({ no_pagination: true });
  const [
    handleType,
    {
      isLoading: handlingTransaction,
      isError: transactionIsError,
      isSuccess: transactionIsSuccess,
      error: transactionError,
    },
  ] = useTransactionTypeMutation();

  const handleAdd = (entity: TransactionType) => {
    setMessage("تم إضافة نوع المعاملة");
    handleType({ data: entity });
  };

  const handleEdit = (updated: TransactionType) => {
    setMessage("تم تعديل نوع المعاملة");
    handleType({
      data: updated,
      method: "PATCH",
      url: `/financials/transaction-types/${updated.id}/`,
    });
  };

  const handleDelete = (id: string) => {
    setMessage("تم حذف نوع المعاملة");
    handleType({
      method: "DELETE",
      url: `/financials/transaction-types/${id}/`,
    });
  };

  const columns = [
    {
      title: "",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "اسم المعاملة",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "النوع",
      dataIndex: "type",
      key: "type",
      render: (type: TransactionKind) => (
        <Tag className="text-base" color={transactionTypeColors[type]}>
          {type === "إيراد" ? "إيراد" : "مصروف"}
        </Tag>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_: any, record: TransactionType) =>
        record.system_related ? (
          <Tag color="red">خاص بالنظام</Tag>
        ) : (
          <div className="flex gap-2">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingaccount(record);
                setIsModalOpen(true);
              }}
            />
            <Popconfirm
              title="هل أنت متأكد من الحذف؟"
              onConfirm={() => handleDelete(record.id)}
              okText="نعم"
              cancelText="إلغاء"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        ),
    },
  ];

  useEffect(() => {
    if (transactionIsError) {
      const error = transactionError as axiosBaseQueryError;
      let message = error.data.detail ?? null;
      notification.error({ message: message ?? "خطأ في تنفيذ الإجراء!" });
    }
  }, [transactionIsError]);

  useEffect(() => {
    if (transactionIsSuccess) {
      notification.success({
        message: message,
      });
    }
  }, [transactionIsSuccess]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <Card title="أنواع المعاملات المالية" className="shadow-md">
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingaccount(null);
            setIsModalOpen(true);
          }}
          loading={handlingTransaction}
          className="bg-gradient-to-l from-green-800 to-green-600 
        hover:from-green-700 hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
         transition-all duration-200"
        >
          إضافة نوع معاملة
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={transactions}
        pagination={false}
        scroll={{x: "max-content"}}
      />

      <TransactionTypeForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingTransaction ? handleEdit : handleAdd}
        initialValues={editingTransaction || undefined}
        loading={handlingTransaction}
      />
    </Card>
  );
};

export default TransactionTypeManager;
