import { useEffect, useState } from "react";
import { Button, Table, Popconfirm, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import WorkEntityForm from "./WorkEntityFrom";
import { WorkEntity } from "@/types/workentity";
import {
  useEntityMutation,
  useGetWorkEntitiesQuery,
} from "@/app/api/endpoints/workentities";
import ErrorPage from "@/pages/Error";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";

const WorkEntitiesManager = () => {
  const notification = useNotification();
  const [editingEntity, setEditingEntity] = useState<WorkEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>("");

  const { data: entities, isFetching, isError } = useGetWorkEntitiesQuery({});
  const [
    handleEntity,
    {
      isLoading: handlingEntity,
      isError: entityIsError,
      isSuccess: entityIsSuccess,
      error: entityError,
    },
  ] = useEntityMutation();

  const handleAdd = (entity: WorkEntity) => {
    setMessage("تم إضافة جهة العمل");
    handleEntity({ data: entity });
  };

  const handleEdit = (updated: WorkEntity) => {
    setMessage("تم تعديل جهة العمل");
    handleEntity({
      data: updated,
      method: "PATCH",
      url: `/clients/workentities/${updated.id}/`,
    });
  };

  const handleDelete = (id: string) => {
    setMessage("تم حذف جهة العمل");
    handleEntity({ method: "DELETE", url: `/clients/workentities/${id}/` });
  };

  const columns = [
    {
      title: "",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_: any, record: WorkEntity) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingEntity(record);
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
    if (entityIsError) {
      const error = entityError as axiosBaseQueryError;
      let message = error.data.detail ?? null;
      notification.error({ message: message ?? "خطأ في تنفيذ الإجراء!" });
    }
  }, [entityIsError]);

  useEffect(() => {
    if (entityIsSuccess) {
      notification.success({
        message: message,
      });
    }
  }, [entityIsSuccess]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <Card title="جهات العمل" className="shadow-md">
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingEntity(null);
            setIsModalOpen(true);
          }}
          loading={handlingEntity}
        >
          إضافة جهة عمل
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={entities}
        pagination={false}
      />

      <WorkEntityForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingEntity ? handleEdit : handleAdd}
        initialValues={editingEntity || undefined}
        loading={handlingEntity}
      />
    </Card>
  );
};

export default WorkEntitiesManager;
