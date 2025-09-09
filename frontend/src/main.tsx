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
          colorPrimary: "#2c2e83",
          fontSize: 17,
        },
        components: { Badge: { statusSize: 12 } },
      }}
      form={{
        scrollToFirstError: { behavior: "smooth", block: "center" },
      }}
      card={{
        styles: {
          header: {
            padding: "0px 20px",
            margin: 0,
            minHeight: "56px",
            overflow: "hidden",
            color: "white",
            backgroundColor: "#2c2e83",
          },
        },
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
