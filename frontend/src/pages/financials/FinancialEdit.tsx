import { useParams } from "react-router";
import Loading from "@/components/Loading";
import FinancialForm from "./FinancialForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "../Error";
import { useGetFinancialRecordQuery } from "@/app/api/endpoints/financial_records";

const FinancialEdit = ({
  financialType,
}: {
  financialType: "income" | "expense";
}) => {
  const { record_id } = useParams();
  if (!record_id) return <ErrorPage />;

  const {
    data: record,
    isFetching,
    isError,
    error: recordError,
  } = useGetFinancialRecordQuery({ id: record_id, format: "form_data" });

  if (isFetching || !record) return <Loading />;
  if (isError) {
    const error_title =
      (recordError as axiosBaseQueryError).status === 404
        ? "عملية غير موجودة! تأكد من رقم العملية المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }
  return <FinancialForm initialValues={record} financialType={financialType} />;
};

export default FinancialEdit;
