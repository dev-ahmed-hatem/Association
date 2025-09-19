import { useEffect, useState } from "react";
import { Card, Avatar, Tabs, Button, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useGetLoanQuery, useLoanMutation } from "@/app/api/endpoints/loans";
import { Loan } from "@/types/loan";
import ErrorPage from "@/pages/Error";
import LoanStatusBadge from "@/components/loans/LoanStatusBadge";
import LoanDetails from "@/components/loans/LoanDetails";

const items = (loan: Loan) => [
  {
    label: "تفاصيل القرض",
    key: "1",
    children: <LoanDetails loan={loan} />,
  },
  {
    label: "الأقساط / السداد",
    key: "2",
    children: <></>,
  },
];

const LoanProfilePage: React.FC = () => {
  const { loan_id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();

  const {
    data: loan,
    isFetching,
    isError,
    error: loanError,
  } = useGetLoanQuery({ id: loan_id as string });

  const [isActive, setIsActive] = useState<boolean | null>(null);

  const [
    deleteLoan,
    {
      isError: deleteIsError,
      error: deleteError,
      isLoading: deleting,
      isSuccess: deleted,
    },
  ] = useLoanMutation();

  useEffect(() => {
    if (deleteIsError) {
      let message = (deleteError as axiosBaseQueryError)?.data.detail ?? null;
      notification.error({
        message: message ?? "فشل حذف القرض",
      });
    }
  }, [deleteIsError]);

  useEffect(() => {
    if (deleted) {
      notification.success({ message: "تم حذف القرض بنجاح" });
      navigate("/financials/loans");
    }
  }, [deleted]);

  const handleDelete = () => {
    deleteLoan({
      url: `/financials/loans/${loan_id}/`,
      method: "DELETE",
      data: {},
    });
  };

  // --- Render ---
  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (loanError as axiosBaseQueryError).status === 404
        ? "قرض غير موجود! تأكد من كود القرض."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

  return (
    <>
      {/* Loan Header */}
      <Card className="shadow-lg rounded-xl">
        <div className="flex items-center justify-between flex-wrap gap-y-6">
          {/* Avatar */}
          <div className="flex items-center flex-wrap gap-4">
            <Avatar size={80} className="bg-red-600 font-semibold">
              قرض
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">قرض #{loan!.id}</h2>
              <p className="text-gray-500">المبلغ: {loan!.amount}</p>
            </div>
          </div>
          {/* Status */}
          <LoanStatusBadge is_completed={loan!.is_completed} />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs className="mt-4" direction="rtl" items={items(loan!)} />

      {/* Footer Actions */}
      <div className="flex justify-between mt-2 flex-wrap gap-2">
        <div className="flex gap-1 flex-col text-sm"></div>

        <div className="btn-wrapper flex md:justify-end mt-4 flex-wrap gap-4">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/financials/loans/edit/${loan_id}`)}
          >
            تعديل البيانات
          </Button>

          <Popconfirm
            title="هل أنت متأكد من حذف هذا القرض؟"
            onConfirm={handleDelete}
            okText="نعم"
            cancelText="لا"
          >
            <Button danger icon={<DeleteOutlined />} loading={deleting}>
              حذف القرض
            </Button>
          </Popconfirm>
        </div>
      </div>
    </>
  );
};

export default LoanProfilePage;
