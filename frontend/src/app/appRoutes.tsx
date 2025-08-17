import Base from "@/pages/Base";
import Error from "@/pages/Error";
import SectionView from "@/pages/SectionView";
import { FaMoneyBill, FaUser } from "react-icons/fa";
import { SettingOutlined } from "@ant-design/icons";
import { RouteObject } from "react-router";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import ClientsList from "@/pages/clients/ClientsList";
import SettingsPage from "@/pages/Settings";
import FinancialRecords from "@/pages/financials/FinancialRecords";
import FinancialsPage from "@/pages/financials/FinancialsPage";
import SalariesPage from "@/pages/financials/Salaries";
import { GiReceiveMoney, GiPayMoney, GiMoneyStack } from "react-icons/gi";

export type AppRoute = RouteObject & {
  key?: string;
  label?: string;
  icon?: React.ReactNode;
  children?: AppRoute[];
};

export const appRoutes: AppRoute[] = [
  {
    path: "",
    element: (
      <AuthProvider>
        <Base />
      </AuthProvider>
    ),
    errorElement: <Base error={true} />,
    children: [
      {
        path: "clients",
        element: (
          <SectionView parentComponent={<ClientsList />} parentUrl="/clients" />
        ),
        icon: <FaUser />,
        label: "الأعضاء",
      },
      {
        path: "financials",
        icon: <FaMoneyBill />,
        label: "الماليات",
        element: <FinancialsPage />,
        children: [
          {
            path: "incomes",
            element: <FinancialRecords financialType="income" />,
            icon: <GiReceiveMoney />,
            label: "الإيرادات",
          },
          {
            path: "expenses",
            element: <FinancialRecords financialType="expense" />,
            icon: <GiPayMoney />,
            label: "المصروفات",
          },
          {
            path: "salaries",
            element: <SalariesPage />,
            icon: <GiMoneyStack />,
            label: "الرواتب",
          },
        ],
      },
      {
        path: "settings",
        element: <SettingsPage />,
        icon: <SettingOutlined />,
        label: "الإعدادات",
      },
    ],
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <Error notFound={true} />,
  },
];

export default appRoutes;
