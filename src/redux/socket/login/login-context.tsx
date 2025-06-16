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
import {
  DITTO_STATUS_JSON_URI,
  DQ_REFERRAL_LINK_PREFIX,
} from "../../../utils/config";
import { useUserSocket } from "../user/user-context";
import { useIdleSkillSocket } from "../idle/skill-context";

export enum DittoStatus {
  error = "ERROR",
  live = "LIVE",
  maintenance = "MAINTENANCE",
}

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
  const { userContextLoaded } = useUserSocket();
  const { offlineProgressUpdatesReceived } = useIdleSkillSocket();

  const isSocketConnected = useSelector(
    (state: RootState) => state.socket.isConnected
  );

  const [dittoStatus, setDittoStatus] = useState<DittoStatus>();

  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState("");
  const [loginComplete, setLoginComplete] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);

  const [validationSent, setValidationSent] = useState(false);
  const loginSucceededRef = useRef(false);

  // Early status fetch before triggering login
  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch(DITTO_STATUS_JSON_URI, {
          cache: "no-store",
        });
        const data = await response.json();

        if (data.status === DittoStatus.live) {
          setDittoStatus(DittoStatus.live); // Proceed normally
        } else if (data.status === DittoStatus.maintenance) {
          setDittoStatus(DittoStatus.maintenance);
          setAccessDeniedMessage("Ditto Quest is currently under maintenance");
          setLoginProgress(100);
          setLoginComplete(true);
        } else {
          setDittoStatus(DittoStatus.error);
          setAccessDeniedMessage("Unexpected server status.");
          setLoginProgress(100);
          setLoginComplete(true);
        }
      } catch (err) {
        console.error("Error fetching status:", err);
        setDittoStatus(DittoStatus.error);
        setAccessDeniedMessage("Unable to reach server.");
        setLoginProgress(100);
        setLoginComplete(true);
      }
    }

    fetchStatus();
  }, []);

  useEffect(() => {
    if (!WebApp.initDataUnsafe.user) {
      setAccessDeniedMessage("Open the game using our TMA instead");
      setLoginProgress(100);
      setLoginComplete(true);
      return;
    }

    if (dittoStatus !== DittoStatus.live) return;

    if (socket && !loadingSocket && !validationSent) {
      socket.emit("validate-login", {
        initData: WebApp.initData,
        userData: WebApp.initDataUnsafe.user,
      });
      setValidationSent(true);
      setLoginProgress(10);
    }
  }, [socket, loadingSocket, validationSent, dittoStatus]);

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

  // Update login progress based on user context and offline progress updates
  useEffect(() => {
    if (!accessGranted || loginComplete) return;

    if (userContextLoaded) {
      setLoginProgress((p) => Math.max(p, 90));
    }

    if (userContextLoaded && offlineProgressUpdatesReceived) {
      setLoginProgress(100);
      // Small delay before marking complete
      setTimeout(() => {
        setLoginComplete(true);
      }, 500);
    }
  }, [userContextLoaded, offlineProgressUpdatesReceived, accessGranted, loginComplete]);

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