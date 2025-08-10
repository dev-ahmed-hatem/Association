import { useEffect, useState } from "react";
import { Button, Table, Popconfirm } from "antd";
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

const WorkEntitiesManager = () => {
  const notification = useNotification();
  const [editingEntity, setEditingEntity] = useState<WorkEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: entities, isFetching, isError } = useGetWorkEntitiesQuery({});
  const [
    handleEntity,
    {
      isLoading: handlingEntity,
      isError: entityIsError,
      isSuccess: entityIsSuccess,
    },
  ] = useEntityMutation();

  // const handleAdd = (entity: WorkEntity) => {
  //   setEntities([...entities, { ...entity, id: Date.now().toString() }]);
  //   message.success("تمت إضافة جهة العمل بنجاح");
  // };

  // const handleEdit = (updated: WorkEntity) => {
  //   setEntities(entities.map((e) => (e.id === updated.id ? updated : e)));
  //   message.success("تم تعديل جهة العمل");
  // };

  const handleDelete = (id: string) => {};

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
      notification.error({ message: "خطأ في تنفيذ الإجراء!" });
    }
  }, [entityIsError]);

  useEffect(() => {
    if (entityIsSuccess) {
      notification.success({
        message: `تم تنفيذ الإجراء`,
      });
    }
  }, [entityIsSuccess]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <div>
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
        onSubmit={() => {}}
        initialValues={editingEntity || undefined}
        loading={handlingEntity}
      />
    </div>
  );
};

export default WorkEntitiesManager;
