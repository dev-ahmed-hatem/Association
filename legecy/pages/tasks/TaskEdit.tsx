import { useParams } from "react-router";
import Error from "../Error";
import Loading from "@/components/Loading";
import ProjectForm from "./TaskForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useGetTaskQuery } from "@/app/api/endpoints/tasks";
import { TaskFormParams } from "@/types/task";

const TaskEdit = () => {
  const { task_id } = useParams();
  if (!task_id) return <Error />;

  const {
    data: taskData,
    isFetching,
    isError,
    error: projectError,
  } = useGetTaskQuery({ id: task_id, format: "form_data" });

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (projectError as axiosBaseQueryError).status === 404
        ? "مهمة غير موجودة! تأكد من كود المهمة المدخل."
        : undefined;

    return <Error subtitle={error_title} reload={error_title === undefined} />;
  }
  return (
    <ProjectForm
      initialValues={taskData as TaskFormParams["initialValues"]}
      taskId={task_id}
    />
  );
};

export default TaskEdit;
