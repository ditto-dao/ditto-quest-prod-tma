import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { UserMission } from "../../utils/types";
import { useSocket } from "../../redux/socket/socket-context";
import { useLoginSocket } from "../../redux/socket/login/login-context";
import { GET_NEXT_MISSION, MISSION_UPDATE } from "../../utils/events";
import { useUserSocket } from "../../redux/socket/user/user-context";

interface MissionNotificationContextValue {
  mission: UserMission | null;
  modalOpen: boolean;
  openMissionModal: (mission: UserMission) => void;
  closeMissionModal: () => void;
  updateMission: (mission: Partial<UserMission>) => void;
  emitGetNextMission: () => void;
}

const MissionNotificationContext = createContext<
  MissionNotificationContextValue | undefined
>(undefined);

export function useMissionNotification() {
  const context = useContext(MissionNotificationContext);
  if (!context)
    throw new Error(
      "useMissionNotification must be used within MissionNotificationProvider"
    );
  return context;
}

export function MissionNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { socket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();

  const [mission, setMission] = useState<UserMission | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openMissionModal = useCallback((mission: UserMission) => {
    setMission(mission);
  }, []);

  const closeMissionModal = useCallback(() => {
    setMission(null);
  }, []);

  const updateMission = useCallback((partial: Partial<UserMission>) => {
    setMission((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const emitGetNextMission = () => {
    if (socket && canEmitEvent()) {
      socket.emit(GET_NEXT_MISSION);
      setLastEventEmittedTimestamp(Date.now());
      setMission(null); // Clear mission while fetching new one
    }
  };

  useEffect(() => {
    if (socket && accessGranted) {
      socket.on(MISSION_UPDATE, (data: UserMission | null) => {
        console.log(
          `Received MISSION_UPDATE: ${JSON.stringify(data, null, 2)}`
        );
        setMission((prev) => {
          if (prev === null && data !== null) return data;
          if (prev !== null && data === null) return null;
          if (prev !== null && data !== null) return { ...prev, ...data };
          return null;
        });
      });

      return () => {
        socket.off(MISSION_UPDATE);
      };
    }
  }, [socket, accessGranted]);

  useEffect(() => {
    setModalOpen(!!mission);
  }, [mission]);

  return (
    <MissionNotificationContext.Provider
      value={{
        mission,
        modalOpen,
        openMissionModal,
        closeMissionModal,
        updateMission,
        emitGetNextMission,
      }}
    >
      {children}
    </MissionNotificationContext.Provider>
  );
}
