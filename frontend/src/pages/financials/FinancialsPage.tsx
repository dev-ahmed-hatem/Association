import FinancialOverview from "../../components/financials/FinancialOverview";
import { Link, useNavigate, useMatch, Outlet } from "react-router";
import appRoutes, { AppRoute } from "../../app/appRoutes";

const FinancialsPage: React.FC = () => {
  const isFinancials = useMatch("/financials");

  if (!isFinancials) return <Outlet />;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">الماليات</h1>
      <FinancialOverview />
      <div className="navigation grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
        {appRoutes[0].children![4].children!.map((item: AppRoute, index) => (
          <Link
            key={index}
            to={item.path!}
            className="flex flex-col items-center justify-center py-8 p-4 bg-calypso-950 text-white rounded-lg shadow-md hover:bg-calypso-900"
          >
            <div className="text-xl md:text-3xl">{item.icon}</div>
            <p className="mt-2 text-base md:text-lg text-center">
              {item.label}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
};

export default FinancialsPage;
