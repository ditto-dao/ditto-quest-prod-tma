import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import SocketManager from "./socket-manager";
import { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  loadingSocket: boolean;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  loadingSocket: true
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loadingSocket, setLoadingSocket] = useState(true);

  useEffect(() => {
    const connectSocket = () => {
      try {
        SocketManager.connect();
        const socketInstance = SocketManager.getInstance();
        if (socketInstance) {
          setSocket(socketInstance);
        } else {
          console.error("Socket connection failed or returned no instance.");
        }
      } catch (error) {
        console.error("Failed to connect socket:", error);
      } finally {
        setLoadingSocket(false);
      }
    };

    connectSocket();

    return () => {
      SocketManager.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        loadingSocket
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
