import { ReactNode } from "react";

export interface Notification {
  id: string;
  content: (id: string) => ReactNode; // changed from ReactNode to function
  isOpen: boolean;
  big?: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (content: (id: string) => ReactNode, big?: boolean) => void;
  removeNotification: (id: string) => void;
}
