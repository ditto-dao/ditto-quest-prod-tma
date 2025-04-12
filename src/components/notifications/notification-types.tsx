import { ReactNode } from "react";

export interface Notification {
  id: string;
  content: ReactNode;
  isOpen: boolean;
  big?: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (content: ReactNode, big?: boolean) => void;
  removeNotification: (id: string) => void;
}
