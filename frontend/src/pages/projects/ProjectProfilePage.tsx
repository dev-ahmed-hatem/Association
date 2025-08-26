import React, { ReactNode, useEffect, useState } from "react";
import { Card, Table, Button, Popconfirm, Switch } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router";
import { FiTrendingUp } from "react-icons/fi";
import {
  clientsEndpoints,
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

type Transaction = {
  key: string;
  value: number;
  description: ReactNode;
  date: string;
};

const incomeData: Transaction[] = [
  { key: "1", value: 1500, description: "دفعة أولى", date: "2025-01-15" },
  { key: "2", value: 2000, description: "دفعة ثانية", date: "2025-02-01" },
];

const expenseData: Transaction[] = [
  { key: "1", value: 500, description: "شراء مواد", date: "2025-01-20" },
  { key: "2", value: 700, description: "أجور عمال", date: "2025-02-05" },
  { key: "2", value: 700, description: "أجور عمال", date: "2025-02-05" },
];

const ProjectProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { project_id } = useParams();
  const notification = useNotification();

  const [status, setStatus] = useState<ProjectStatus | null>();

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
    { isError: deleteError, isLoading: deleting, isSuccess: deleted },
  ] = useProjectMutation();

  const columns = [
    { title: "البيان", dataIndex: "description", key: "description" },
    {
      title: "القيمة",
      dataIndex: "value",
      key: "value",
      // render: (v: number) => `${v} ج.م`,
    },
    { title: "التاريخ", dataIndex: "date", key: "date" },
  ];

  const totalRow = (data: Transaction[]) => [
    {
      key: "total",
      value: data.reduce((sum, item) => sum + item.value, 0),
      description: <strong>الإجمالي</strong>,
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
        clientsEndpoints.util.updateQueryData(
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
    if (deleteError) {
      notification.error({
        message: "حدث خطأ أثناء حذف المشروع ! برجاء إعادة المحاولة",
      });
    }
  }, [deleteError]);

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

  return (
    <div className="p-6 space-y-6">
      {/* Project Info */}
      <Card className="shadow-md rounded-2xl bg-gradient-to-l from-indigo-950 to-indigo-400 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4">
          {/* Project Name */}
          <div>
            <h2 className="text-2xl font-bold">{project?.name}</h2>
            <p className="text-gray-200 mt-1">
              تاريخ البدء: <span dir="rtl">{project?.start_date}</span>
            </p>
          </div>

          {/* Project Status */}
          {status !== null && (
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

      {/* Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incomes */}
        <Card
          title={
            <div className="flex justify-between items-center bg-gradient-to-r from-green-400 to-green-600 text-white p-4 h-16">
              <span className="font-semibold">الإيرادات</span>
              {project?.status === "قيد التنفيذ" && (
                <Button type="primary" icon={<PlusOutlined />}>
                  إضافة
                </Button>
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
            dataSource={[...incomeData, ...totalRow(incomeData)]}
            columns={columns}
            rowKey="id"
            pagination={false}
            rowClassName={(record) =>
              record.key === "total" ? "bg-green-50 font-semibold" : ""
            }
          />
        </Card>

        {/* Expenses */}
        <Card
          title={
            <div className="flex justify-between items-center bg-gradient-to-r from-red-400 to-red-600 text-white p-4 h-16">
              <span className="font-semibold">المصروفات</span>
              {project?.status === "قيد التنفيذ" && (
                <Button type="primary" icon={<PlusOutlined />}>
                  إضافة
                </Button>
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
            dataSource={[...expenseData, ...totalRow(expenseData)]}
            columns={columns}
            rowKey="id"
            pagination={false}
            rowClassName={(record) =>
              record.key === "total" ? "bg-red-50 font-semibold" : ""
            }
          />
        </Card>
      </div>
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
          <span className="text-2xl font-bold">500 ج.م</span>
        </div>
      </Card>

      <div className="btn-wrapper flex md:justify-end mt-4 flex-wrap gap-4">
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            navigate(`/projects/edit/${project_id}`);
          }}
        >
          تعديل البيانات
        </Button>
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
          >
            حذف المشروع
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default ProjectProfilePage;
