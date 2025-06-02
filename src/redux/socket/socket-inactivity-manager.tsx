import { useEffect, useRef } from "react";
import SocketManager from "./socket-manager";
import { useSocket } from "./socket-context";
import { INACTIVITY_TIMEOUT_MS } from "../../utils/config";

const SocketInactivityManager: React.FC = () => {
  const { socket } = useSocket();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log("Disconnecting socket due to inactivity.");
      SocketManager.disconnect();
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

    const handleActivity = () => {
      if (socket && socket.connected) {
        resetInactivityTimer();
      }
    };

    activityEvents.forEach((event) => window.addEventListener(event, handleActivity));
    resetInactivityTimer(); // Start on mount

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [socket]);

  return null; // No UI
};

export default SocketInactivityManager;