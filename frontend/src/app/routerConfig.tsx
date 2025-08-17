import { RouteObject } from "react-router";
import appRoutes, { AppRoute } from "./appRoutes";
import ClientForm from "@/pages/clients/ClientForm";
import ClientProfilePage from "@/pages/clients/ClientProfilePage";
import ClientEdit from "@/pages/clients/ClientEdit";
import FinancialForm from "@/pages/financials/FinancialForm";
import FinancialProfilePage from "@/pages/financials/FinancialProfilePage";

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
  clients: [
    { path: "client-profile/:client_id", element: <ClientProfilePage /> },
    { path: "add", element: <ClientForm /> },
    { path: "edit/:client_id", element: <ClientEdit /> },
  ],
  "financials/incomes": [
    { path: "add", element: <FinancialForm financialRecord="income" /> },
    { path: ":income_id", element: <FinancialProfilePage /> },
  ],
  "financials/expenses": [
    { path: "add", element: <FinancialForm financialRecord="expense" /> },
    { path: ":expense_id", element: <FinancialProfilePage /> },
  ],
});

export default routes;
