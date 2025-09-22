import { useGetClientQuery } from "@/app/api/endpoints/clients";
import { useParams } from "react-router";
import Loading from "@/components/Loading";
import ClientForm from "./ClientForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "../Error";
import { usePermission } from "@/providers/PermissionProvider";

const ClientEdit = () => {
  const { can } = usePermission();
  if (!can("clients.edit"))
    return (
      <ErrorPage
        title="ليس لديك صلاحية للوصول إلى هذه الصفحة"
        subtitle="يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة."
        reload={false}
      />
    );
  const { client_id } = useParams();
  if (!client_id) return <ErrorPage />;

  const {
    data: employeeData,
    isFetching,
    isError,
    error: employeeError,
  } = useGetClientQuery({ id: client_id, format: "form_data" });

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (employeeError as axiosBaseQueryError).status === 404
        ? "عضو غير موجود! تأكد من كود العضو المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }
  return <ClientForm initialValues={employeeData} client_id={client_id} />;
};

export default ClientEdit;
