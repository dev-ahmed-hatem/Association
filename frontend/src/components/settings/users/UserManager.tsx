import { useEffect, useState } from "react";
import { Button, Table, Popconfirm, Card, Tag, Form } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
} from "@ant-design/icons";
import ErrorPage from "@/pages/Error";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useGetUsersQuery, useUserMutation } from "@/app/api/endpoints/users";
import { User } from "@/types/user";
import UserForm from "./UserForm";
import { handleServerErrors } from "@/utils/handleForm";
import PermissionManager from "./PermissionManager";
import { useAppSelector } from "@/app/redux/hooks";

const UserManager = () => {
  const notification = useNotification();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changePassword, setChangePassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [form] = Form.useForm();
  const user = useAppSelector((state) => state.auth.user);

  const {
    data: users,
    isFetching,
    isError,
  } = useGetUsersQuery({ no_pagination: true });

  const [
    handleUser,
    {
      isLoading: handlingUser,
      isError: userIsError,
      isSuccess: userIsSuccess,
      error: userError,
    },
  ] = useUserMutation();

  const handleAdd = (entity: User) => {
    setMessage("تم إضافة المستخدم");
    handleUser({ data: entity });
  };

  const handleEdit = (updated: User) => {
    changePassword
      ? setMessage("تم تغيير كلمة المرور")
      : setMessage("تم تعديل المستخدم");

    handleUser({
      data: updated,
      method: "PATCH",
      url: `/users/users/${updated.id}/`,
    });
  };

  const handleDelete = (id: string) => {
    setMessage("تم حذف المستخدم");
    handleUser({
      method: "DELETE",
      url: `/users/users/${id}/`,
    });
  };

  const columns = [
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "اسم المستخدم",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "الدور",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "مدير" ? "gold" : "blue"} className="text-base">
          {role}
        </Tag>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_: any, record: User) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              setIsModalOpen(true);
            }}
          />
          {record.role === "مشرف" && (
            <>
              <Popconfirm
                title="هل أنت متأكد من الحذف؟"
                onConfirm={() => handleDelete(record.id)}
                okText="نعم"
                cancelText="إلغاء"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
              <PermissionManager user_id={record.id} />
            </>
          )}
          {(record.id === user!.id || record.role === "مشرف") && (
            <Button
              icon={<LockOutlined />}
              onClick={() => {
                setEditingUser(record);
                setIsModalOpen(true);
                setChangePassword(true);
              }}
            >
              تغيير كلمة المرور
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (userIsError) {
      const error = userError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      } else {
        let message = error.data.detail ?? null;
        notification.error({ message: message ?? "خطأ في تنفيذ الإجراء!" });
      }
    }
  }, [userIsError]);

  useEffect(() => {
    if (userIsSuccess) {
      notification.success({
        message: message,
      });
      setIsModalOpen(false);
      setChangePassword(false);
      form.resetFields();
    }
  }, [userIsSuccess]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;

  return (
    <Card title="إدارة المستخدمين" className="shadow-md">
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          loading={handlingUser}
          className="bg-gradient-to-l from-green-800 to-green-600 
        hover:from-green-700 hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
         transition-all duration-200"
        >
          إضافة مستخدم
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <UserForm
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={editingUser || changePassword ? handleEdit : handleAdd}
        initialValues={editingUser || undefined}
        loading={handlingUser}
        form={form}
        changePassword={changePassword}
      />
    </Card>
  );
};

export default UserManager;
