import { useEffect } from "react";
import { Card, Avatar, Tabs, Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useGetLoanQuery, useLoanMutation } from "@/app/api/endpoints/loans";
import { Loan } from "@/types/loan";
import ErrorPage from "@/pages/Error";
import LoanStatusBadge from "@/components/financials/loans/LoanStatusBadge";
import LoanDetails from "@/components/financials/loans/LoanDetails";
import LoanRepayments from "@/components/financials/loans/LoanRepayments";
import { usePermission } from "@/providers/PermissionProvider";

const LoanProfilePage: React.FC = () => {
  const { can } = usePermission();
  const { loan_id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();

  const {
    data: loan,
    isFetching,
    isError,
    error: loanError,
  } = useGetLoanQuery({ id: loan_id as string });

  const [
    deleteLoan,
    {
      isError: deleteIsError,
      error: deleteError,
      isLoading: deleting,
      isSuccess: deleted,
    },
  ] = useLoanMutation();

  const items = (loan: Loan) => [
    {
      label: "تفاصيل القرض",
      key: "1",
      children: <LoanDetails loan={loan} />,
    },
    ...(can("loans.viewRepayments")
      ? [
          {
            label: "الأقساط / السداد",
            key: "2",
            children: (
              <LoanRepayments
                client_name={loan.client_data.name}
                loan_id={loan.id.toString()}
                is_active={loan.client_data.is_active}
              />
            ),
          },
        ]
      : []),
  ];

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

  if (!can("loans.view"))
    return (
      <ErrorPage
        title="ليس لديك صلاحية للوصول إلى هذه الصفحة"
        subtitle="يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة."
        reload={false}
      />
    );

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
          {can("loans.delete") && (
            <Popconfirm
              title="سيتم حذف القرض بجميع السجلات المالية الخاصة به؟"
              onConfirm={handleDelete}
              okText="نعم"
              cancelText="لا"
            >
              <Button
                className="enabled:bg-red-500 enabled:border-red-500 enabled:shadow-[0_2px_0_rgba(0,58,58,0.31)]
            enabled:hover:border-red-400 enabled:hover:bg-red-400 enabled:text-white"
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
              >
                حذف القرض
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>
    </>
  );
};

export default LoanProfilePage;
