import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "../socket-context";
import { SlimeWithTraits, SocketProviderProps } from "../../../utils/types";
import { useLoginSocket } from "../login/login-context";
import { useUserSocket } from "../user/user-context";

export interface FarmingStatus {
  startTimestamp: number;
  durationS: number;
}

interface FarmingStartPayload {
  itemId: number;
  startTimestamp: number;
  durationS: number;
}

interface FarmingStopPayload {
  itemId: number;
}

export interface CraftingStatus {
  startTimestamp: number;
  durationS: number;
}

interface CraftingStartPayload {
  equipmentId: number;
  startTimestamp: number;
  durationS: number;
}

interface CraftingStopPayload {
  equipmentId: number;
}

export interface BreedingStatus {
  startTimestamp: number;
  sireId: number;
  dameId: number;
  durationS: number;
}

export interface ProgressUpdate {
  type: "crafting" | "breeding" | "farming" | "combat";
  update: {
    equipment?: {
      equipmentId: number;
      equipmentName: string;
      quantity: number;
    }[];
    items?: {
      itemId: number;
      itemName: string;
      quantity: number;
    }[];
    expGained?: number;
    slime?: {
      slimeId: number;
    };
  };
}

// Context
interface IdleContext {
  farmingStatuses: Record<number, FarmingStatus | null>;
  craftingStatuses: Record<number, CraftingStatus | null>;
  slimeToBreed0: SlimeWithTraits | undefined;
  setSlimeToBreed0: React.Dispatch<
    React.SetStateAction<SlimeWithTraits | undefined>
  >;
  slimeToBreed1: SlimeWithTraits | undefined;
  setSlimeToBreed1: React.Dispatch<
    React.SetStateAction<SlimeWithTraits | undefined>
  >;
  breedingStatus: BreedingStatus | undefined;
}

const IdleContext = createContext<IdleContext>({
  farmingStatuses: {},
  craftingStatuses: {},
  slimeToBreed0: undefined,
  setSlimeToBreed0: () => {},
  slimeToBreed1: undefined,
  setSlimeToBreed1: () => {},
  breedingStatus: undefined,
});

export const useIdleSocket = () => useContext(IdleContext);

export const IdleSocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { userData } = useUserSocket();

  // Farming
  const [farmingStatuses, setFarmingStatuses] = useState<
    Record<number, FarmingStatus | null>
  >({});

  // Crafting
  const [craftingStatuses, setCraftingStatuses] = useState<
    Record<number, CraftingStatus | null>
  >({});

  // Breeding
  const [slimeToBreed0, setSlimeToBreed0] = useState<
    SlimeWithTraits | undefined
  >();
  const [slimeToBreed1, setSlimeToBreed1] = useState<
    SlimeWithTraits | undefined
  >();
  const [breedingStatus, setBreedingStatus] = useState<
    BreedingStatus | undefined
  >();
  // Temporary state for unresolved IDs
  const [unresolvedSireId, setUnresolvedSireId] = useState<number | null>(null);
  const [unresolvedDameId, setUnresolvedDameId] = useState<number | null>(null);

  useEffect(() => {
    if (socket && !loadingSocket && accessGranted) {
      // Farming
      socket.on("farming-start", (data: FarmingStartPayload) => {
        console.log(`Received farming-start: ${JSON.stringify(data, null, 2)}`);
        setFarmingStatuses((prevStatuses) => ({
          ...prevStatuses,
          [data.itemId]: {
            startTimestamp: data.startTimestamp,
            durationS: data.durationS,
          },
        }));
      });

      socket.on("farming-stop", (data: FarmingStopPayload) => {
        console.log(`Received farming-stop: ${JSON.stringify(data, null, 2)}`);
        setFarmingStatuses((prevStatuses) => ({
          ...prevStatuses,
          [data.itemId]: null,
        }));
      });

      // Crafting
      socket.on("crafting-start", (data: CraftingStartPayload) => {
        console.log(
          `Received crafting-start: ${JSON.stringify(data, null, 2)}`
        );
        setCraftingStatuses((prevStatuses) => ({
          ...prevStatuses,
          [data.equipmentId]: {
            startTimestamp: data.startTimestamp,
            durationS: data.durationS,
          },
        }));
      });

      socket.on("crafting-stop", (data: CraftingStopPayload) => {
        console.log(`Received crafting-stop: ${JSON.stringify(data, null, 2)}`);
        setCraftingStatuses((prevStatuses) => ({
          ...prevStatuses,
          [data.equipmentId]: null,
        }));
      });

      // Idle progress
      socket.on("idle-progress-update", (data: ProgressUpdate[]) => {
        console.log(
          `Received idle-progress-update: ${JSON.stringify(data, null, 2)}`
        );
        let alertMessage = "";

        data.forEach((update) => {
          if (update.update.equipment) {
            update.update.equipment.forEach((equipment) => {
              if (equipment.quantity !== 0) {
                const sign = equipment.quantity > 0 ? "+" : "";
                alertMessage += `${equipment.equipmentName} ${sign}${equipment.quantity}\n`;
              }
            });
          }

          if (update.update.items) {
            update.update.items.forEach((item) => {
              if (item.quantity !== 0) {
                const sign = item.quantity > 0 ? "+" : "";
                alertMessage += `${item.itemName} ${sign}${item.quantity}\n`;
              }
            });
          }

          if (update.update.slime) {
            alertMessage += `Slime #${update.update.slime.slimeId} +1\n`;
          }
        });

        // Alert the final message
        if (alertMessage.trim() !== "") {
          alert(alertMessage.trim());
        }
      });

      // Breeding
      socket.on("breeding-start", (data: BreedingStatus) => {
        console.log(
          `Received breeding-start: ${JSON.stringify(data, null, 2)}`
        );
        setBreedingStatus(data);

        // Store IDs temporarily if slimes are not yet available
        const sire = userData.slimes?.find(
          (element) => element.id === data.sireId
        );
        if (sire) setSlimeToBreed0(sire);
        else setUnresolvedSireId(data.sireId); // Temporarily store the ID

        const dame = userData.slimes?.find(
          (element) => element.id === data.dameId
        );
        if (dame) setSlimeToBreed1(dame);
        else setUnresolvedDameId(data.dameId); // Temporarily store the ID
      });

      socket.on("breeding-stop", (data: { sireId: number; dameId: number }) => {
        console.log(`Received breeding-stop: ${JSON.stringify(data, null, 2)}`);
        setBreedingStatus(undefined);
      });

      return () => {
        socket.off("crafting-start");
        socket.off("crafting-stop");
        socket.off("breeding-start");
        socket.off("breeding-stop");
        socket.off("idle-progress-update");
      };
    }
  }, [socket, loadingSocket, accessGranted]);

  // Resolve unresolved IDs to slimes once userData.slimes is available
  useEffect(() => {
    if (unresolvedSireId && userData.slimes) {
      const sire = userData.slimes.find(
        (slime) => slime.id === unresolvedSireId
      );
      if (sire) {
        setSlimeToBreed0(sire);
        setUnresolvedSireId(null); // Clear temporary storage
      }
    }

    if (unresolvedDameId && userData.slimes) {
      const dame = userData.slimes.find(
        (slime) => slime.id === unresolvedDameId
      );
      if (dame) {
        setSlimeToBreed1(dame);
        setUnresolvedDameId(null); // Clear temporary storage
      }
    }
  }, [unresolvedSireId, unresolvedDameId, userData.slimes]);

  return (
    <IdleContext.Provider
      value={{
        farmingStatuses,
        craftingStatuses,
        slimeToBreed0,
        setSlimeToBreed0,
        slimeToBreed1,
        setSlimeToBreed1,
        breedingStatus,
      }}
    >
      {children}
    </IdleContext.Provider>
  );
};
