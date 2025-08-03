import { useGetEmployeeQuery } from "@/app/api/endpoints/employees";
import { useParams } from "react-router";
import Error from "../Error";
import Loading from "@/components/Loading";
import EmployeeForm from "./EmployeeForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";

const EmployeeEdit = () => {
  const { emp_id } = useParams();
  if (!emp_id) return <Error />;

  const {
    data: employeeData,
    isFetching,
    isError,
    error: employeeError,
  } = useGetEmployeeQuery({ id: emp_id, format: "form_data" });

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (employeeError as axiosBaseQueryError).status === 404
        ? "موظف غير موجود! تأكد من كود الموظف المدخل."
        : undefined;

    return <Error subtitle={error_title} reload={error_title === undefined} />;
  }
  return <EmployeeForm initialValues={employeeData} employeeId={emp_id} />;
};

export default EmployeeEdit;
