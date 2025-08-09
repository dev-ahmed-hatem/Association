import React, { useEffect } from "react";
import { Card, Avatar, Tabs, Button, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getInitials, isOverdue } from "@/utils";
import ProjectDetails from "@/components/projects/ProjectDetails";
import TasksOverview from "@/components/tasks/TasksOverview";
import { Project } from "@/types/project";
import ProjectTasks from "@/components/projects/ProjectTasks";
import { useNavigate, useParams } from "react-router";
import { useNotification } from "@/providers/NotificationProvider";
import {
  useDeleteProjectMutation,
  useGetProjectQuery,
} from "@/app/api/endpoints/projects";
import Loading from "@/components/Loading";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import Error from "@/pages/Error";
import { TabsProps } from "antd/lib";
import ProjectStatus from "@/components/projects/ProjectStatus";

const getTabItems = (project: Project) => {
  const items: TabsProps["items"] = [];

  if (["قيد التنفيذ", "مكتمل"].includes(project.status)) {
    items.push({
      label: "نظرة عامة على المهام",
      key: "1",
      children: <TasksOverview stats={project.stats} />,
    });
  }

  items.push({
    label: "تفاصيل المشروع",
    key: "2",
    children: <ProjectDetails project={project} />,
  });

  if (["قيد التنفيذ", "مكتمل"].includes(project.status)) {
    items.push({
      label: "المهام",
      key: "3",
      children: <ProjectTasks project={project} />,
    });
  }

  return items;
};

const ProjectProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { project_id } = useParams();

  const {
    data: project,
    isFetching,
    isError,
    error: projectError,
  } = useGetProjectQuery({
    id: project_id as string,
    format: "detailed",
  });

  const isProjectOverdue = !!(
    project?.end_date &&
    isOverdue(project?.end_date) &&
    !["مكتمل", "قيد الموافقة"].includes(project?.status as string)
  );

  const [
    deleteProject,
    { isError: deleteError, isLoading: deleting, isSuccess: deleted },
  ] = useDeleteProjectMutation();

  const handleDelete = () => {
    deleteProject(project_id as string);
  };

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

    return <Error subtitle={error_title} reload={error_title === undefined} />;
  }
  return (
    <>
      {/* Project Header */}
      <Card
        className={`shadow-lg rounded-xl ${
          project?.status === "مكتمل" && "border-green-600 border-x-8"
        } ${isProjectOverdue && "border-red-500 border-x-8 "}`}
      >
        <div className="flex items-center justify-between flex-wrap gap-y-6 gap-x-4">
          {/* Avatar with Fallback */}
          <div className="flex items-center flex-wrap gap-4">
            <Avatar
              size={80}
              className={`bg-calypso-700 ${
                project?.status === "مكتمل" && "bg-green-600"
              } ${isProjectOverdue && "bg-red-500"} font-semibold`}
            >
              {getInitials(project!.name)}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{project!.name}</h2>
              <p className="text-gray-500">{project!.client}</p>
            </div>
          </div>

          {/* Status */}
          {project?.status === "مكتمل" ? (
            <Tag color="green" className="text-sm p-2 text-center">
              مكتمل
            </Tag>
          ) : (
            <ProjectStatus
              id={project_id as string}
              isProjectOverdue={isProjectOverdue}
            />
          )}
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs
        className="mt-4"
        defaultActiveKey="1"
        direction="rtl"
        items={getTabItems(project!)}
      />

      <div className="flex justify-between mt-2 flex-wrap gap-2">
        {/* Meta Data */}
        <div className="flex gap-1 flex-col text-sm">
          <div>
            <span className="font-medium text-gray-700" dir="rtl">
              تاريخ الإضافة:{" "}
            </span>
            {project!.created_at}
          </div>
          <div>
            <span className="font-medium text-gray-700">بواسطة: </span>
            {project!.created_by || "غير مسجل"}
          </div>
        </div>

        {/* Action Button */}
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
    </>
  );
};

export default ProjectProfilePage;
