import Base from "@/pages/Base";
import Error from "@/pages/Error";
import SectionView from "@/pages/SectionView";
import ProjectsList from "@/pages/projects/ProjectsList";
import { FaUser, FaCalendarCheck, FaMoneyBill, FaFile } from "react-icons/fa";
import { FaDiagramProject, FaCalendarDays } from "react-icons/fa6";
import { GiReceiveMoney, GiPayMoney, GiMoneyStack } from "react-icons/gi";
import { LuNotebookPen } from "react-icons/lu";
import { MdAssignment } from "react-icons/md";
import { RouteObject } from "react-router";
import TasksList from "@/pages/tasks/TasksList";
import AttendancePage from "@/pages/attendance/AttendancePage";
import FinancialsPage from "@/pages/financials/FinancialsPage";
import FilesPage from "@/pages/files/FilesPage";
import SalariesPage from "@/pages/financials/Salaries";
import FinancialRecords from "@/pages/financials/FinancialRecords";
import NotesPage from "@/pages/notes/NotesPage";
import SchedulesPage from "@/pages/schedules/SchedulesPage";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import ClientsList from "@/pages/clients/ClientsList";

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
          <SectionView
            parentComponent={<ClientsList />}
            parentUrl="/clients"
          />
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
        icon: <FaDiagramProject />,
        label: "المشاريع",
      },
      {
        path: "tasks",
        element: (
          <SectionView parentComponent={<TasksList />} parentUrl="/tasks" />
        ),
        icon: <MdAssignment />,
        label: "المهام",
      },
      {
        path: "attendance",
        element: <AttendancePage />,
        icon: <FaCalendarCheck />,
        label: "الحضور والانصراف",
      },
      {
        path: "financials",
        icon: <FaMoneyBill />,
        label: "الماليات",
        element: <FinancialsPage />,
        children: [
          {
            path: "incomes",
            element: <FinancialRecords financialItem="income" />,
            icon: <GiReceiveMoney />,
            label: "الإيرادات",
          },
          {
            path: "expenses",
            element: <FinancialRecords financialItem="expense" />,
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
        path: "schedules",
        element: <SchedulesPage />,
        icon: <FaCalendarDays />,
        label: "جدول المواعيد",
      },
      {
        path: "notes",
        element: <NotesPage />,
        icon: <LuNotebookPen />,
        label: "المذكرات",
      },
      {
        path: "files",
        element: <FilesPage />,
        icon: <FaFile />,
        label: "الملفات",
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
