import Base from "@/pages/Base";
import Error from "@/pages/Error";
import SectionView from "@/pages/SectionView";
import { FaUser } from "react-icons/fa";
import { SettingOutlined } from "@ant-design/icons";
import { RouteObject } from "react-router";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import ClientsList from "@/pages/clients/ClientsList";
import SettingsPage from "@/pages/Settings";

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
        path: "settings",
        element: <SettingsPage />,
        icon: <SettingOutlined />,
        label: "الإعدادات",
      },
      // {
      //   path: "financials",
      //   icon: <FaMoneyBill />,
      //   label: "الماليات",
      //   element: <FinancialsPage />,
      //   children: [
      //     {
      //       path: "incomes",
      //       element: <FinancialRecords financialItem="income" />,
      //       icon: <GiReceiveMoney />,
      //       label: "الإيرادات",
      //     },
      //     {
      //       path: "expenses",
      //       element: <FinancialRecords financialItem="expense" />,
      //       icon: <GiPayMoney />,
      //       label: "المصروفات",
      //     },
      //     {
      //       path: "salaries",
      //       element: <SalariesPage />,
      //       icon: <GiMoneyStack />,
      //       label: "الرواتب",
      //     },
      //   ],
      // },
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
