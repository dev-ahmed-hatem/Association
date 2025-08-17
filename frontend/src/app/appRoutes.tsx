import Base from "@/pages/Base";
import Error from "@/pages/Error";
import SectionView from "@/pages/SectionView";
import { FaMoneyBill, FaUser } from "react-icons/fa";
import { CalendarOutlined, CreditCardOutlined, SettingOutlined } from "@ant-design/icons";
import { RouteObject } from "react-router";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import ClientsList from "@/pages/clients/ClientsList";
import SettingsPage from "@/pages/Settings";
import FinancialRecords from "@/pages/financials/FinancialRecords";
import FinancialsPage from "@/pages/financials/FinancialsPage";
import { GiReceiveMoney, GiPayMoney } from "react-icons/gi";

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
            path: "subscriptions",
            element: <h1 className="text-center">الاشتراكات الشهرية</h1>,
            icon: <CalendarOutlined />,
            label: "الاشتراكات الشهرية",
          },
          {
            path: "installments",
            element: <h1 className="text-center">الأقساط</h1>,
            icon: <CreditCardOutlined />,
            label: "الأقساط",
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
