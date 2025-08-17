import FinancialOverview from "../../components/financials/FinancialOverview";
import { Link, useNavigate, useMatch, Outlet } from "react-router";
import appRoutes, { AppRoute } from "../../app/appRoutes";
import FinancialsNav from "@/components/financials/FinancialsNav";
import { Divider } from "antd";

const FinancialsPage: React.FC = () => {
  const isFinancials = useMatch("/financials");

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
