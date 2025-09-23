import FinancialOverview from "../../components/financials/FinancialOverview";
import { useMatch, Outlet } from "react-router";
import FinancialsNav from "@/components/financials/FinancialsNav";
import { Divider } from "antd";
import { usePermission } from "@/providers/PermissionProvider";
import ErrorPage from "../Error";

const FinancialsPage: React.FC = () => {
  const { hasModulePermission } = usePermission();
  const isFinancials = useMatch("/financials");

  if (
    !hasModulePermission("incomes") &&
    !hasModulePermission("expenses") &&
    !hasModulePermission("subscriptions") &&
    !hasModulePermission("installments") &&
    !hasModulePermission("loans")
  )
    return (
      <ErrorPage
        title="ليس لديك صلاحية للوصول إلى هذه الصفحة"
        subtitle="يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة."
        reload={false}
      />
    );

  if (!isFinancials) return <Outlet />;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">الماليات</h1>
      <FinancialsNav />
      <Divider className="my-12" />
      <FinancialOverview />
    </>
  );
};

export default FinancialsPage;
