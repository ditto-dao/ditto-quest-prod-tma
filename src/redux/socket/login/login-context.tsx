import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WebApp from "@twa-dev/sdk";
import { setTelegramId } from "../../telegram-id-slice";
import { useSocket } from "../socket-context";
import { setTelegramUsername } from "../../telegram-username-slice";
import { RootState } from "../../store";
import { SocketProviderProps } from "../../../utils/types";
import { getFingerprint } from "../../../utils/fingerprint";
import { STORE_FINGERPRINT_EVENT } from "../../../utils/events";

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
  const [connectionEstablished, setConnectionEstablished] = useState(false);

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
      socket.on("login-validated", async (telegramId: string) => {
        setConnectionEstablished(true);
        console.log(`Login validated for user: ${telegramId}`);
        setAccessGranted(true);
        setSocketDataLoadComplete(true);
        dispatch(setTelegramId(telegramId));
        dispatch(
          setTelegramUsername(
            WebApp.initDataUnsafe.user?.username || `user_${telegramId}`
          )
        );
        socket.emit(STORE_FINGERPRINT_EVENT, await getFingerprint());
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

      socket.on("disconnect", () => {
        console.warn("Socket disconnected");
        if (connectionEstablished) {
          setAccessGranted(false);
          setAccessDeniedMessage("Disconnected from server");
          setSocketDataLoadComplete(true);
        }
      });

      return () => {
        socket.off("login-validated");
        socket.off("login-invalid");
        socket.off("tele-validate-error");
        socket.off("disconnect");
      };
    }
  }, [socket, loadingSocket]);

  useEffect(() => {
    if (!loginAttempted) return;

    if (!socket && !loadingSocket) {
      setAccessGranted(false);
      setAccessDeniedMessage("Unable to connect to server");
      setSocketDataLoadComplete(true);
      return;
    }

    if (connectionEstablished && !isSocketConnected && !loadingSocket) {
      setAccessGranted(false);
      setAccessDeniedMessage("Disconnected from server");
      setSocketDataLoadComplete(true);
    }
  }, [
    socket,
    loadingSocket,
    isSocketConnected,
    loginAttempted,
    connectionEstablished,
  ]);

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
