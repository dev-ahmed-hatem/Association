import { useEffect, useState } from "react";
import { Button, Table, Popconfirm, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import BankAccountForm from "./BankAccountFrom";
import ErrorPage from "@/pages/Error";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { BankAccount } from "@/types/bank_account";
import {
  useBankAccountMutation,
  useGetBankAccountsQuery,
} from "@/app/api/endpoints/bank_accounts";

const BankAccountManager = () => {
  const notification = useNotification();
  const [editingAccount, setEditingaccount] = useState<BankAccount | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>("");

  const {
    data: accounts,
    isFetching,
    isError,
  } = useGetBankAccountsQuery({ no_pagination: true });
  const [
    handleAccount,
    {
      isLoading: handlingAccount,
      isError: accountIsError,
      isSuccess: accountIsSuccess,
      error: accountError,
    },
  ] = useBankAccountMutation();

  const handleAdd = (entity: BankAccount) => {
    setMessage("تم إضافة الحساب البنكي");
    handleAccount({ data: entity });
  };

  const handleEdit = (updated: BankAccount) => {
    setMessage("تم تعديل الحساب البنكي");
    handleAccount({
      data: updated,
      method: "PATCH",
      url: `/financials/bank-accounts/${updated.id}/`,
    });
  };

  const handleDelete = (id: string) => {
    setMessage("تم حذف الحساب البنكي");
    handleAccount({
      method: "DELETE",
      url: `/financials/bank-accounts/${id}/`,
    });
  };

  const columns = [
    // {
    //   title: "",
    //   dataIndex: "id",
    //   key: "id",
    // },
    {
      title: "الحساب",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_: any, record: BankAccount) => (
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
    if (accountIsError) {
      const error = accountError as axiosBaseQueryError;
      let message = error.data.detail ?? null;
      notification.error({ message: message ?? "خطأ في تنفيذ الإجراء!" });
    }
  }, [accountIsError]);

  useEffect(() => {
    if (accountIsSuccess) {
      notification.success({
        message: message,
      });
    }
  }, [accountIsSuccess]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <Card title="الحسابات البنكية" className="shadow-md">
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingaccount(null);
            setIsModalOpen(true);
          }}
          loading={handlingAccount}
          className="bg-gradient-to-l from-green-800 to-green-600 
        hover:from-green-700 hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
         transition-all duration-200"
        >
          إضافة حساب بنكي
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={accounts}
        pagination={false}
      />

      <BankAccountForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingAccount ? handleEdit : handleAdd}
        initialValues={editingAccount || undefined}
        loading={handlingAccount}
      />
    </Card>
  );
};

export default BankAccountManager;
