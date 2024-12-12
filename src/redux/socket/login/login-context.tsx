import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WebApp from "@twa-dev/sdk";
import { setTelegramId } from "../../telegram-id-slice";
import { useSocket } from "../socket-context";
import { setTelegramUsername } from "../../telegram-username-slice";
import { RootState } from "../../store";
import { SocketProviderProps } from "../../../utils/types";

// Context
interface LoginContext {
  accessGranted: boolean;
  accessDeniedMessage: string;
  socketDataLoadComplete: boolean;
}

const LoginContext = createContext<LoginContext>({
  accessGranted: false,
  accessDeniedMessage: "",
  socketDataLoadComplete: false,
});

export const useLoginSocket = () => useContext(LoginContext);

export const LoginSocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const { socket, loadingSocket } = useSocket();

  // Login
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState("");

  const isSocketConnected = useSelector(
    (state: RootState) => state.socket.isConnected
  );

  const [socketDataLoadComplete, setSocketDataLoadComplete] = useState(false);

  useEffect(() => {
    if (!WebApp.initDataUnsafe.user) {
      setAccessDeniedMessage("Open the game using our TMA instead");
      setSocketDataLoadComplete(true);
      return;
    }

    if (socket && !loadingSocket && !loginAttempted) {
      console.log(`Attempting validate login`);
      console.log(WebApp.initDataUnsafe.user);
      socket.emit("validate-login", {
        initData: WebApp.initData,
        userData: WebApp.initDataUnsafe.user,
      });
      setLoginAttempted(true);
    }
  }, [socket, loadingSocket, loginAttempted]);

  useEffect(() => {
    if (socket && !loadingSocket) {
      socket.on("login-validated", (telegramId: number) => {
        console.log(`Login validated for user: ${telegramId}`);
        setAccessGranted(true);
        dispatch(setTelegramId(telegramId));
        dispatch(
          setTelegramUsername(
            WebApp.initDataUnsafe.user?.username || `user_${telegramId}`
          )
        );
      });

      socket.on("login-invalid", (msg: string) => {
        console.log(`Login invalidated`);
        setAccessDeniedMessage(msg);
        setSocketDataLoadComplete(true);
      });

      socket.on("tele-validate-error", (msg: string) => {
        console.log(`Tele validate error received`);
        setAccessDeniedMessage(msg);
        setSocketDataLoadComplete(true);
      });

      return () => {
        socket.off("login-validated");
        socket.off("login-invalid");
        socket.off("tele-validate-error");
      };
    }
  }, [socket, loadingSocket]);

  useEffect(() => {
    if (!socket && !loadingSocket) {
      setAccessGranted(false);
      setAccessDeniedMessage("Unable to connect to server");
      return;
    }

    if (!isSocketConnected && !loadingSocket) {
      setAccessGranted(false);
      setAccessDeniedMessage("Disconnected from server");
      return;
    }
  }, [socket, loadingSocket, isSocketConnected]);

  useEffect(() => {
    setSocketDataLoadComplete(true);
  }, []);

  return (
    <LoginContext.Provider
      value={{
        accessGranted,
        accessDeniedMessage,
        socketDataLoadComplete,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
