import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import routes from "./app/routerConfig";
import { arEG } from "./utils/locale";
import { ConfigProvider } from "antd";
import "./styles/tables.css";
import "./styles/add-form.css";
import { Provider as ReduxProvider } from "react-redux";
import store from "./app/redux/store";
import NotificationProvider from "./providers/NotificationProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#25272c",
          fontFamily: "cairo",
        },
      }}
      form={{
        scrollToFirstError: { behavior: "smooth", block: "center" },
      }}
      locale={arEG}
    >
      <ReduxProvider store={store}>
        <NotificationProvider>
          <RouterProvider router={createBrowserRouter(routes)} />
        </NotificationProvider>
      </ReduxProvider>
    </ConfigProvider>
  </StrictMode>
);
