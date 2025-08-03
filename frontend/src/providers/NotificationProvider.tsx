import { notification } from "antd";
import { NotificationInstance } from "antd/lib/notification/interface";
import { createContext, useContext, useMemo } from "react";

const NotificationContext = createContext<NotificationInstance | null>(null);

export const useNotification = (): NotificationInstance => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [api, contextHolder] = notification.useNotification({
    placement: "bottomRight",
  });
  const contextValue = useMemo(() => api, [api]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
