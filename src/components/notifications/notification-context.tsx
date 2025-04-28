import { createContext, useContext, useState, FC, ReactNode } from "react";
import { v4 as uuid } from "uuid";
import { NotificationContextType, Notification } from "./notification-types";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    content: (id: string) => ReactNode,
    big?: boolean
  ) => {
    const nextId = uuid();
    console.log("Creating modal:", nextId);
    const newNotification: Notification = {
      id: nextId,
      content,
      isOpen: false,
      big,
    };
    setNotifications((currentNotifications) => [
      ...currentNotifications,
      newNotification,
    ]);
    openNotification(nextId);
  };

  const openNotification = (id: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, isOpen: true }
          : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
