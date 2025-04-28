import React, { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "../socket-context";
import { SlimeWithTraits, SocketProviderProps } from "../../../utils/types";
import { useLoginSocket } from "../login/login-context";
import { useNotification } from "../../../components/notifications/notification-context";
import ErrorNotification from "../../../components/notifications/notification-content/error/error-notification";

export interface SlimeGachaPullRes {
  slime: SlimeWithTraits;
  rankPull: string;
  slimeNoBg: ArrayBuffer;
}

// Context
interface GachaContext {
    slimeDrawn: string | null;
    setSlimeDrawn: React.Dispatch<React.SetStateAction<string | null>>;
    slimeObjDrawn: SlimeGachaPullRes | null;
    rollingSlime: boolean;
    setRollingSlime: React.Dispatch<React.SetStateAction<boolean>>;
}

const GachaContext = createContext<GachaContext>({
    slimeDrawn: null,
    setSlimeDrawn: () => {},
    slimeObjDrawn: null,
    rollingSlime: false,
    setRollingSlime: () => {},
});

export const useGachaSocket = () => useContext(GachaContext);

export const GachaSocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { addNotification } = useNotification();
  
  const [rollingSlime, setRollingSlime] = useState<boolean>(false);
  const [slimeDrawn, setSlimeDrawn] = useState<string | null>(null);
  const [slimeObjDrawn, setSlimeObjDrawn] = useState<SlimeGachaPullRes | null>(null);

  useEffect(() => {
    if (socket && !loadingSocket) {
      // Slime gacha
      const handleSlimeGachaUpdate = (res: SlimeGachaPullRes) => {
        try {
          console.log("Slime gacha response:", res);

          if (res.slimeNoBg instanceof ArrayBuffer) {
            const binary = new Uint8Array(res.slimeNoBg).reduce(
              (acc, byte) => acc + String.fromCharCode(byte),
              ""
            );
            const base64Image = `data:image/png;base64,${btoa(binary)}`;
            setSlimeDrawn(base64Image);
            setSlimeObjDrawn(res);

          } else {
            console.error("Invalid ArrayBuffer received:", res.slimeNoBg);
          }
        } catch (error) {
          console.error("Error converting ArrayBuffer to Base64:", error);
        }
      };

      socket.on("slime-gacha-update", handleSlimeGachaUpdate);

      socket.on("mint-slime-error", (msg: string) => {
        addNotification(() => <ErrorNotification msg={msg} />)
        setRollingSlime(false);
      });

      return () => {
        socket.off("slime-gacha-update");
        socket.off("mint-slime-error");
      };
    }
  }, [socket, loadingSocket, accessGranted]);

  return <GachaContext.Provider value={{
    slimeDrawn,
    setSlimeDrawn,
    slimeObjDrawn,
    rollingSlime,
    setRollingSlime
  }}>{children}</GachaContext.Provider>;
};
