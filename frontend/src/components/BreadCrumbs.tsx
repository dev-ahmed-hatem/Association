import React, { useEffect, useState } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import appRoutes, { AppRoute } from "../app/appRoutes";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const [items, setItems] = useState<BreadcrumbItemType[]>([]);

  const build = (
    appRoutes: AppRoute[],
    pathname: string,
    parentPath?: string
  ) => {
    appRoutes.forEach((route) => {
      const routeFullPath = parentPath
        ? parentPath + "/" + route.path
        : route.path;

      if (pathname === routeFullPath || pathname.startsWith(routeFullPath!)) {
        setItems((items) => [
          ...items,
          {
            href: routeFullPath,
            title: (
              <>
                {route.icon} {route.label}
              </>
            ),
          },
        ]);
      }
      if (pathname.startsWith(routeFullPath!) && route.children?.length) {
        build(route.children, pathname, routeFullPath);
      }
    });
  };

  useEffect(() => {
    setItems([]);
    build(appRoutes, location.pathname.slice(1));
  }, [location.pathname]);

  return (
    <div>
      <Breadcrumb
        itemRender={(route, params, routes, pathes) => {
          if (route.href === "")
            return (
              <Link
                to={route.href!}
                className="inline-block bg-gradient-to-r from-minsk to-slate-900
              hover:from-minsk/90 hover:to-slate-800 text-white text-center px-4"
              >
                <HomeOutlined />
              </Link>
            );
          else
            return (
              <Link to={route.href!} className="flex items-center gap-2 p-3">
                {route.title}
              </Link>
            );
        }}
        items={items}
      />
    </div>
  );
};

export default Breadcrumbs;
