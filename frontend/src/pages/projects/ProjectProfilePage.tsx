import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Popconfirm,
  Switch,
  Space,
  Form,
  Modal,
  InputNumber,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router";
import { FiTrendingUp } from "react-icons/fi";
import {
  projectsEndpoints,
  useGetProjectQuery,
  useProjectMutation,
  useSwitchProjectStatusMutation,
} from "@/app/api/endpoints/projects";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import Loading from "@/components/Loading";
import ErrorPage from "../Error";
import { useAppDispatch } from "@/app/redux/hooks";
import { Project, ProjectStatus } from "@/types/project";
import { useNotification } from "@/providers/NotificationProvider";
import ProjectTransactionModal from "@/components/projects/ProjectTransactionModal";
import {
  useGetProjectTransactionsQuery,
  useProjectTransactionMutation,
} from "@/app/api/endpoints/project_transactions.ts";
import { ProjectTransaction } from "@/types/project_transaction";
import { usePermission } from "@/providers/PermissionProvider";

const ProjectProfilePage: React.FC = () => {
  const { can } = usePermission();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { project_id } = useParams();
  const notification = useNotification();
  const [message, setMessage] = useState<string | null>(null);

  const [status, setStatus] = useState<ProjectStatus | null>();

  // editing modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProjectTransaction | null>(
    null
  );
  const [form] = Form.useForm();

  const {
    data: project,
    isFetching,
    isError,
    error: projectError,
  } = useGetProjectQuery({ id: project_id as string });
  const [
    switchStatus,
    { data: switchRes, isLoading: switching, isError: switchError },
  ] = useSwitchProjectStatusMutation();
  const [
    deleteProject,
    {
      isError: deleteIsError,
      error: deleteError,
      isLoading: deleting,
      isSuccess: deleted,
    },
  ] = useProjectMutation();

  const [
    handleTransaction,
    {
      isLoading: loadingTransaction,
      isError: transactionIsError,
      isSuccess: transactionSuccess,
    },
  ] = useProjectTransactionMutation();

  const editTransaction = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({ amount: record.amount });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      setMessage("تم تعديل القيمة");
      handleTransaction({
        url: `/projects/project-transactions/${editingRecord?.id}/update_amount/`,
        data: { amount: values.amount },
        method: "PATCH",
      });
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const deleteTransaction = (id: string) => {
    setMessage("تم حذف السجل");
    handleTransaction({
      url: `/projects/project-transactions/${id}/`,
      method: "DELETE",
    });
  };

  const {
    data: transactions,
    isFetching: fetchingTransactions,
    isError: transactionsIsError,
  } = useGetProjectTransactionsQuery({ project: project_id as string });

  const columns = [
    { title: "البيان", dataIndex: "statement", key: "statement" },
    {
      title: "القيمة",
      dataIndex: "amount",
      key: "amount",
    },
    { title: "التاريخ", dataIndex: "date", key: "date" },
    {
      title: "إجراءات",
      key: "actions",
      render: (_: any, record: any) =>
        record.key !== "total" &&
        project?.status === "قيد التنفيذ" && (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={deleting || loadingTransaction}
              onClick={() => editTransaction(record)}
            />

            <Popconfirm
              title="هل أنت متأكد من حذف هذا السجل؟"
              okText="نعم"
              cancelText="لا"
              onConfirm={() => deleteTransaction(record.id)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={deleting || loadingTransaction}
              />
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const totalRow = (amount: number) => [
    {
      key: "total",
      amount,
      statement: <strong>الإجمالي</strong>,
      date: "",
    },
  ];

  const toggleStatus = () => {
    switchStatus({
      id: project_id as string,
      status: project?.status === "قيد التنفيذ" ? "منتهي" : "قيد التنفيذ",
    });
  };

  const handleDelete = () => {
    deleteProject({
      url: `/projects/projects/${project_id}/`,
      method: "DELETE",
    });
  };

  useEffect(() => {
    if (project) setStatus(project.status);
  }, [project]);

  useEffect(() => {
    if (switchError) {
      notification.error({
        message: "حدث خطأ في تغيير الحالة ! برجاء إعادة المحاولة",
      });
    }
  }, [switchError]);

  useEffect(() => {
    if (switchRes) {
      if (project) setStatus(switchRes.status);
      dispatch(
        projectsEndpoints.util.updateQueryData(
          "getProject",
          { id: project_id as string },
          (draft: Project) => {
            draft.status = switchRes.status;
          }
        )
      );
      notification.success({
        message: "تم تغيير الحالة بنجاح",
      });
    }
  }, [switchRes]);

  useEffect(() => {
    if (transactionIsError) {
      notification.error({
        message: "حدث خطأ أثناء التنفيذ ! برجاء إعادة المحاولة",
      });
    }
  }, [transactionIsError]);

  useEffect(() => {
    if (transactionSuccess) {
      notification.success({
        message: message,
      });

      setIsModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    }
  }, [transactionSuccess]);

  useEffect(() => {
    if (deleteIsError) {
      let message = (deleteError as axiosBaseQueryError)?.data.detail ?? null;
      notification.error({
        message: message ?? "حدث خطأ أثناء حذف المشروع ! برجاء إعادة المحاولة",
      });
    }
  }, [deleteIsError]);

  useEffect(() => {
    if (deleted) {
      notification.success({
        message: "تم حذف المشروع بنجاح",
      });

      navigate("/projects");
    }
  }, [deleted]);

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (projectError as axiosBaseQueryError).status === 404
        ? "مشروع غير موجود! تأكد من كود المشروع المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }
  if (!can("projects.view"))
    return (
      <ErrorPage
        title="ليس لديك صلاحية للوصول إلى هذه الصفحة"
        subtitle="يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة."
        reload={false}
      />
    );

  return (
    <div className="space-y-6">
      {/* Project Info */}
      <Card className="shadow-md rounded-2xl bg-gradient-to-l from-indigo-950 to-indigo-400 text-white">
        <div className="flex flex-row justify-between items-center gap-6 p-4">
          {/* Project Name */}
          <div>
            <h2 className="text-2xl font-bold">{project?.name}</h2>
            <p className="text-gray-200 mt-1">
              تاريخ البدء: <span dir="rtl">{project?.start_date}</span>
            </p>
          </div>

          {/* Project Status */}
          {can("projects.edit") && status !== null && (
            <Switch
              checked={status === "قيد التنفيذ"}
              onChange={toggleStatus}
              checkedChildren="قيد التنفيذ"
              unCheckedChildren="منتهي"
              loading={switching}
              className="bg-black"
            />
          )}
        </div>
      </Card>

      {fetchingTransactions && <Loading />}

      {transactionsIsError && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-lg font-semibold text-red-600">حدث خطأ</p>
          <p className="text-gray-500 text-sm">يرجى إعادة المحاولة لاحقًا</p>
        </div>
      )}

      {!fetchingTransactions && transactions && (
        <>
          {/* Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incomes */}
            <Card
              title={
                <div className="flex justify-between items-center bg-gradient-to-r from-green-400 to-green-600 text-white p-4 h-16">
                  <span className="font-semibold">الإيرادات</span>
                  {can("incomes.add") && project?.status === "قيد التنفيذ" && (
                    <ProjectTransactionModal
                      project_id={project_id!}
                      type="income"
                    />
                  )}
                </div>
              }
              variant="borderless"
              className="shadow-lg rounded-2xl"
              styles={{
                header: {
                  padding: 0,
                  borderRadius: "",
                },
              }}
            >
              <Table
                dataSource={[
                  ...transactions.incomes.transactions,
                  ...totalRow(transactions.incomes.total),
                ]}
                columns={columns}
                rowKey="id"
                pagination={false}
                rowClassName={(
                  record: Partial<ProjectTransaction> & { key?: string }
                ) =>
                  record.key === "total" ? "bg-green-50 font-semibold" : ""
                }
              />
            </Card>

            {/* Expenses */}
            <Card
              title={
                <div className="flex justify-between items-center bg-gradient-to-r from-red-400 to-red-600 text-white p-4 h-16">
                  <span className="font-semibold">المصروفات</span>
                  {can("expenses.add") && project?.status === "قيد التنفيذ" && (
                    <ProjectTransactionModal
                      project_id={project_id!}
                      type="expense"
                    />
                  )}
                </div>
              }
              variant="borderless"
              className="shadow-lg rounded-2xl"
              styles={{
                header: {
                  padding: 0,
                  borderRadius: "",
                },
              }}
            >
              <Table
                dataSource={[
                  ...transactions.expenses.transactions,
                  ...totalRow(transactions.expenses.total),
                ]}
                columns={columns}
                rowKey="id"
                pagination={false}
                rowClassName={(
                  record: Partial<ProjectTransaction> & { key?: string }
                ) => (record.key === "total" ? "bg-red-50 font-semibold" : "")}
              />
            </Card>
          </div>

          {/* net revenues */}
          <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              {/* Icon */}
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <FiTrendingUp size={28} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold">الصافي</h2>
              </div>

              {/* Value */}
              <span className="text-2xl font-bold">
                {transactions.net.toLocaleString()} ج.م
              </span>
            </div>
          </Card>
        </>
      )}

      <div className="btn-wrapper flex md:justify-end mt-4 flex-wrap gap-4">
        {can("projects.edit") && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              navigate(`/projects/edit/${project_id}`);
            }}
          >
            تعديل البيانات
          </Button>
        )}
        {can("projects.delete") && (
          <Popconfirm
            title="هل أنت متأكد من حذف هذا المشروع؟"
            onConfirm={handleDelete}
            okText="نعم"
            cancelText="لا"
          >
            <Button
              className="enabled:bg-red-500 enabled:border-red-500 enabled:shadow-[0_2px_0_rgba(0,58,58,0.31)]
                  enabled:hover:border-red-400 enabled:hover:bg-red-400 enabled:text-white"
              icon={<DeleteOutlined />}
              loading={deleting}
              disabled={loadingTransaction}
            >
              حذف المشروع
            </Button>
          </Popconfirm>
        )}
      </div>

      {/* editing amount modal */}
      <Modal
        title="تعديل القيمة"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form form={form} layout="vertical" name="editForm">
          <Form.Item
            name="amount"
            label="القيمة"
            rules={[{ required: true, message: "يرجى إدخال القيمة" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectProfilePage;
