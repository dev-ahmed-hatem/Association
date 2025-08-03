import { RouteObject } from "react-router";
import appRoutes, { AppRoute } from "./appRoutes";
import EmployeeProfilePage from "@/pages/clients/EmployeeProfilePage";
import EmployeeForm from "@/pages/clients/EmployeeForm";
import ProjectForm from "@/pages/projects/ProjectForm";
import ProjectProfilePage from "@/pages/projects/ProjectProfilePage";
import TaskProfilePage from "@/pages/tasks/TaskProfilePage";
import TaskForm from "@/pages/tasks/TaskForm";
import FinancialForm from "@/pages/financials/FinancialForm";
import FinancialProfilePage from "@/pages/financials/FinancialProfilePage";
import SalaryForm from "@/pages/financials/SalaryForm";
import AddSchedule from "@/pages/schedules/AddSchedule";
import NotePreview from "@/pages/notes/NotePreview";
import AddNote from "@/pages/notes/AddNote";
import EmployeeEdit from "@/pages/clients/EmployeeEdit";
import ProjectEdit from "@/pages/projects/ProjectEdit";
import TaskEdit from "@/pages/tasks/TaskEdit";

const alterRoute = function (
  appRoutes: AppRoute[],
  routePath: string,
  newRoute: RouteObject,
  parentPath?: string
): AppRoute[] {
  return appRoutes.map((route) => {
    const currentRoutePath = parentPath
      ? `${parentPath}/${route.path}`
      : route.path;

    if (currentRoutePath === routePath) {
      return { ...route, ...newRoute } as RouteObject;
    }

    if (route.children?.length) {
      return {
        ...route,
        children: alterRoute(
          route.children,
          routePath,
          newRoute,
          currentRoutePath
        ),
      };
    }

    return route;
  });
};

const addSubRoutes = (
  appRoutes: AppRoute[],
  subRoutes: { [key: string]: RouteObject[] },
  parentPath?: string
): AppRoute[] => {
  return appRoutes.map((route) => {
    const currentRoutePath = parentPath
      ? `${parentPath}/${route.path}`
      : route.path;

    const matchedChildren = subRoutes[currentRoutePath!];

    return {
      ...route,
      children: [
        ...(matchedChildren || []),
        ...(route.children
          ? addSubRoutes(route.children, subRoutes, currentRoutePath)
          : []),
      ],
    } as AppRoute;
  });
};

let routes: RouteObject[] = addSubRoutes(appRoutes, {
  employees: [
    { path: "employee-profile/:emp_id", element: <EmployeeProfilePage /> },
    { path: "add", element: <EmployeeForm /> },
    { path: "edit/:emp_id", element: <EmployeeEdit /> },
  ],
  projects: [
    { path: "project/:project_id", element: <ProjectProfilePage /> },
    { path: "add", element: <ProjectForm /> },
    { path: "edit/:project_id", element: <ProjectEdit /> },
  ],
  tasks: [
    { path: "task/:task_id", element: <TaskProfilePage /> },
    { path: "add", element: <TaskForm /> },
    { path: "edit/:task_id", element: <TaskEdit /> },
  ],
  "financials/incomes": [
    { path: "add", element: <FinancialForm financialItem="income" /> },
    { path: ":income_id", element: <FinancialProfilePage /> },
  ],
  "financials/expenses": [
    { path: "add", element: <FinancialForm financialItem="expense" /> },
    { path: ":expense_id", element: <FinancialProfilePage /> },
  ],
  "financials/salaries": [{ path: "edit", element: <SalaryForm /> }],
  notes: [
    { path: ":note_id", element: <NotePreview /> },
    { path: "add", element: <AddNote /> },
  ],
  schedules: [{ path: "add", element: <AddSchedule /> }],
});

export default routes;
