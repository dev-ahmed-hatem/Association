import Base from "@/pages/Base";
import Error from "@/pages/Error";
import SectionView from "@/pages/SectionView";
import { FaMoneyBill, FaProjectDiagram, FaUser } from "react-icons/fa";
import {
  CalendarOutlined,
  CreditCardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { RouteObject } from "react-router";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import ClientsList from "@/pages/clients/ClientsList";
import SettingsPage from "@/pages/Settings";
import FinancialRecords from "@/pages/financials/FinancialRecords";
import FinancialsPage from "@/pages/financials/FinancialsPage";
import { GiReceiveMoney, GiPayMoney } from "react-icons/gi";
import ProjectsList from "@/pages/projects/ProjectList";
import SubscriptionsPage from "@/pages/financials/SubscriptionsPage";
import InstallmentsPage from "@/pages/financials/InstallmentsPage";

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
        path: "projects",
        element: (
          <SectionView
            parentComponent={<ProjectsList />}
            parentUrl="/projects"
          />
        ),
        icon: <FaProjectDiagram />,
        label: "المشروعات",
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
            element: <SubscriptionsPage />,
            icon: <CalendarOutlined />,
            label: "الاشتراكات الشهرية",
          },
          {
            path: "installments",
            element: <InstallmentsPage />,
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
