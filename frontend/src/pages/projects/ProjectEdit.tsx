import { useGetProjectQuery } from "@/app/api/endpoints/projects";
import { useParams } from "react-router";
import Loading from "@/components/Loading";
import ProjectForm from "./ProjectForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "../Error";
import { usePermission } from "@/providers/PermissionProvider";

const ProjectEdit = () => {
  const { can } = usePermission();
  if (!can("projects.edit"))
    return (
      <ErrorPage
        title="ليس لديك صلاحية للوصول إلى هذه الصفحة"
        subtitle="يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة."
        reload={false}
      />
    );
  const { project_id } = useParams();
  if (!project_id) return <ErrorPage />;

  const {
    data: projectData,
    isFetching,
    isError,
    error: projectError,
  } = useGetProjectQuery({ id: project_id });

  if (isFetching) return <Loading />;

  if (isError) {
    const error_title =
      (projectError as axiosBaseQueryError).status === 404
        ? "المشروع غير موجود! تأكد من كود المشروع المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

  return <ProjectForm initialValues={projectData} />;
};

export default ProjectEdit;
