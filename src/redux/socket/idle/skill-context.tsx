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
interface SkillContext {
  farmingStatuses: Record<number, FarmingStatus | null>;
  startFarming: (
    itemId: number,
    startTimestamp: number,
    durationS: number
  ) => void;
  stopFarming: (itemId: number) => void;
  craftingStatuses: Record<number, CraftingStatus | null>;
  startCrafting: (
    equipmentId: number,
    startTimestamp: number,
    durationS: number
  ) => void;
  stopCrafting: (equipmentId: number) => void;
  breedingStatus: BreedingStatus | undefined;
  slimeToBreed0: SlimeWithTraits | undefined;
  slimeToBreed1: SlimeWithTraits | undefined;
  setSlimeToBreed: (slime: SlimeWithTraits) => void;
  startBreeding: (startTimestamp: number, durationS: number) => void;
  stopBreeding: () => void;
}

const SkillContext = createContext<SkillContext>({
  farmingStatuses: {},
  craftingStatuses: {},
  slimeToBreed0: undefined,
  slimeToBreed1: undefined,
  setSlimeToBreed: () => {},
  breedingStatus: undefined,
  startFarming: () => {},
  stopFarming: () => {},
  startCrafting: () => {},
  stopCrafting: () => {},
  startBreeding: () => {},
  stopBreeding: () => {},
});

export const useIdleSkillSocket = () => useContext(SkillContext);

export const IdleSkillSocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { userData } = useUserSocket();

  // Farming
  const [farmingStatuses, setFarmingStatuses] = useState<
    Record<number, FarmingStatus | null>
  >({});

  const startFarming = (
    itemId: number,
    startTimestamp: number,
    durationS: number
  ) => {
    /* setFarmingStatuses((prevStatuses) => ({
      ...prevStatuses,
      [itemId]: { startTimestamp, durationS },
    })); */
    setFarmingStatuses({
      [itemId]: { startTimestamp, durationS },
    });
    console.log(`Started farming for item ID ${itemId}`);
  };

  const stopFarming = (itemId: number) => {
    setFarmingStatuses((prevStatuses) => ({
      ...prevStatuses,
      [itemId]: null,
    }));
    console.log(`Stopped farming for item ID ${itemId}`);
  };

  // Crafting
  const [craftingStatuses, setCraftingStatuses] = useState<
    Record<number, CraftingStatus | null>
  >({});

  const startCrafting = (
    equipmentId: number,
    startTimestamp: number,
    durationS: number
  ) => {
    /* setCraftingStatuses((prevStatuses) => ({
      ...prevStatuses,
      [equipmentId]: { startTimestamp, durationS },
    })); */
    setCraftingStatuses({
      [equipmentId]: { startTimestamp, durationS },
    });
    console.log(`Started crafting for equipment ID ${equipmentId}`);
  };

  const stopCrafting = (equipmentId: number) => {
    setCraftingStatuses((prevStatuses) => ({
      ...prevStatuses,
      [equipmentId]: null,
    }));
    console.log(`Stopped crafting for equipment ID ${equipmentId}`);
  };

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
  const [lastSlimeToBreedSet, setLastSlimeToBreedSet] = useState<0 | 1>(1);

  const setSlimeToBreed = (slime: SlimeWithTraits) => {
    if (lastSlimeToBreedSet === 1) {
      setSlimeToBreed0(slime);
      setLastSlimeToBreedSet(0);
    } else {
      setSlimeToBreed1(slime);
      setLastSlimeToBreedSet(1);
    }
  };

  const startBreeding = (startTimestamp: number, durationS: number) => {
    if (slimeToBreed0 && slimeToBreed1) {
      setBreedingStatus({
        startTimestamp: startTimestamp,
        sireId: slimeToBreed0.id,
        dameId: slimeToBreed1.id,
        durationS: durationS,
      });
    }

    console.log(
      `Started breeding for slimes ${slimeToBreed0?.id} and ${slimeToBreed1?.id}`
    );
  };

  const stopBreeding = () => {
    setBreedingStatus(undefined);
    console.log(`Stopped breeding.`);
  };

  // Temporary state for unresolved IDs
  const [unresolvedSireId, setUnresolvedSireId] = useState<number | null>(null);
  const [unresolvedDameId, setUnresolvedDameId] = useState<number | null>(null);

  useEffect(() => {
    if (socket && !loadingSocket) {
      // Farming
      socket.on("farming-start", (data: FarmingStartPayload) => {
        console.log(`Received farming-start: ${JSON.stringify(data, null, 2)}`);
        setFarmingStatuses((prevStatuses) => {
          if (
            prevStatuses[data.itemId] !== undefined &&
            prevStatuses[data.itemId] !== null
          ) {
            // If the object at data.itemId is not null or undefined, return the previous state unchanged
            return prevStatuses;
          }

          // Otherwise, update the state
          return {
            ...prevStatuses,
            [data.itemId]: {
              startTimestamp: data.startTimestamp + 200,
              durationS: data.durationS,
            },
          };
        });
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
            startTimestamp: data.startTimestamp + 200,
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

      return () => {
        socket.off("farming-start");
        socket.off("farming-stop");
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
    <SkillContext.Provider
      value={{
        farmingStatuses,
        startFarming,
        stopFarming,
        craftingStatuses,
        startCrafting,
        stopCrafting,
        breedingStatus,
        slimeToBreed0,
        slimeToBreed1,
        setSlimeToBreed,
        startBreeding,
        stopBreeding,
      }}
    >
      {children}
    </SkillContext.Provider>
  );
};
