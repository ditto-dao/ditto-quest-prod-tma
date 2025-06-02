import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import WebApp from "@twa-dev/sdk";
import { setTelegramId } from "../../telegram-id-slice";
import { useSocket } from "../socket-context";
import { setTelegramUsername } from "../../telegram-username-slice";
import { RootState } from "../../store";
import { SocketProviderProps } from "../../../utils/types";
import { getFingerprint } from "../../../utils/fingerprint";
import {
  STORE_FINGERPRINT_EVENT,
  USE_REFERRAL_CODE,
} from "../../../utils/events";
import { DQ_REFERRAL_LINK_PREFIX } from "../../../utils/config";

interface LoginContext {
  accessGranted: boolean;
  accessDeniedMessage: string;
  loginComplete: boolean;
  loginProgress: number;
}

const LoginContext = createContext<LoginContext>({
  accessGranted: false,
  accessDeniedMessage: "",
  loginComplete: false,
  loginProgress: 0,
});

export const useLoginSocket = () => useContext(LoginContext);

export const LoginSocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const { socket, loadingSocket } = useSocket();

  const isSocketConnected = useSelector(
    (state: RootState) => state.socket.isConnected
  );

  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState("");
  const [loginComplete, setLoginComplete] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);

  const [validationSent, setValidationSent] = useState(false);
  const loginSucceededRef = useRef(false);

  useEffect(() => {
    if (!WebApp.initDataUnsafe.user) {
      setAccessDeniedMessage("Open the game using our TMA instead");
      setLoginProgress(100);
      setLoginComplete(true);
      return;
    }

    if (socket && !loadingSocket && !validationSent) {
      socket.emit("validate-login", {
        initData: WebApp.initData,
        userData: WebApp.initDataUnsafe.user,
      });
      setValidationSent(true);
      setLoginProgress(10);
    }
  }, [socket, loadingSocket, validationSent]);

  useEffect(() => {
    if (!socket || loadingSocket) return;

    const onLoginValidated = async (telegramId: string) => {
      setLoginProgress((p) => Math.max(p, 50));
      dispatch(setTelegramId(telegramId));
      dispatch(
        setTelegramUsername(
          WebApp.initDataUnsafe.user?.username || `user_${telegramId}`
        )
      );

      socket.emit(STORE_FINGERPRINT_EVENT, await getFingerprint());
      setLoginProgress((p) => Math.max(p, 70));

      const inviteLink = WebApp.initDataUnsafe.start_param;
      if (inviteLink?.startsWith(DQ_REFERRAL_LINK_PREFIX)) {
        socket.emit(USE_REFERRAL_CODE, inviteLink);
        setLoginProgress((p) => Math.max(p, 85));
      }

      setAccessGranted(true);
      loginSucceededRef.current = true;

      // Add a short delay before marking login complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoginProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoginComplete(true);
    };

    const onLoginInvalid = (msg: string) => {
      setAccessGranted(false);
      loginSucceededRef.current = false;
      setAccessDeniedMessage(msg);
      setLoginProgress(100);
      setLoginComplete(true);
    };

    const onTeleValidateError = (msg: string) => {
      setAccessGranted(false);
      loginSucceededRef.current = false;
      setAccessDeniedMessage(msg);
      setLoginProgress(100);
      setLoginComplete(true);
    };

    const onDisconnect = () => {
      console.warn("Socket disconnected");
      if (loginSucceededRef.current) {
        setAccessGranted(false);
        setAccessDeniedMessage("Disconnected from server");
        setLoginProgress(100);
        setLoginComplete(true);
      }
    };

    socket.on("login-validated", onLoginValidated);
    socket.on("login-invalid", onLoginInvalid);
    socket.on("tele-validate-error", onTeleValidateError);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("login-validated", onLoginValidated);
      socket.off("login-invalid", onLoginInvalid);
      socket.off("tele-validate-error", onTeleValidateError);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket, loadingSocket]);

  useEffect(() => {
    if (!validationSent) return;

    if (!socket && !loadingSocket) {
      setAccessGranted(false);
      setAccessDeniedMessage("Unable to connect to server");
      setLoginProgress(100);
      setLoginComplete(true);
      return;
    }

    if (loginSucceededRef.current && !isSocketConnected && !loadingSocket) {
      setAccessGranted(false);
      setAccessDeniedMessage("Disconnected from server");
      setLoginProgress(100);
      setLoginComplete(true);
    }
  }, [socket, loadingSocket, isSocketConnected, validationSent]);

  return (
    <LoginContext.Provider
      value={{
        accessGranted,
        accessDeniedMessage,
        loginComplete,
        loginProgress,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
