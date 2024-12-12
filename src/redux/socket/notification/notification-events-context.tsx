import React, { createContext, useContext, useEffect } from "react";
import { useSocket } from "../socket-context";

// Context Interface
interface NotificationEventsContextProps {}

// Creating Context
const NotificationEventsContext = createContext<NotificationEventsContextProps>({});

// Custom hook for using the context
export const useNotificationEvents = () => useContext(NotificationEventsContext);

// Provider Component
function NotificationEventsProvider({ children }: { children: React.ReactNode }) {
  const { socket, loadingSocket } = useSocket();

  useEffect(() => {
    if (socket && !loadingSocket) {


      // Clean up on unmount
      return () => {
      };
    }
  }, [socket, loadingSocket]);

  return (
    <NotificationEventsContext.Provider value={{}}>
      {children}
    </NotificationEventsContext.Provider>
  );
}

export default NotificationEventsProvider;
