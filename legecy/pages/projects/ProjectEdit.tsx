import { useParams } from "react-router";
import Error from "../Error";
import Loading from "@/components/Loading";
import ProjectForm from "./ProjectForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useGetProjectQuery } from "@/app/api/endpoints/projects";
import { ProjectFormParams } from "@/types/project";

const ProjectEdit = () => {
  const { project_id } = useParams();
  if (!project_id) return <Error />;

  const {
    data: projectData,
    isFetching,
    isError,
    error: projectError,
  } = useGetProjectQuery({ id: project_id, format: "form_data" });

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (projectError as axiosBaseQueryError).status === 404
        ? "مشروع غير موجود! تأكد من كود المشروع المدخل."
        : undefined;

    return <Error subtitle={error_title} reload={error_title === undefined} />;
  }
  return (
    <ProjectForm
      initialValues={projectData as ProjectFormParams["initialValues"]}
      projectId={project_id}
    />
  );
};

export default ProjectEdit;
