import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "../socket-context";
import { SlimeWithTraits, SocketProviderProps } from "../../../utils/types";
import { useLoginSocket } from "../login/login-context";
import { useUserSocket } from "../user/user-context";
import { useNotification } from "../../../components/notifications/notification-context";
import OfflineProgressNotification from "../../../components/notifications/notification-content/offline-progress/offline-progress-notification";
import DQLogo from "../../../assets/images/general/dq-logo.png";
import { useCurrentActivityContext } from "./current-activity-context";

export interface FarmingStatus {
  startTimestamp: number;
  durationS: number;
}

interface FarmingStartPayload {
  itemId: number;
  name: string;
  imgsrc: string;
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
  name: string;
  imgsrc: string;
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
  offlineProgressUpdatesReceived: boolean;
  update: {
    equipment?: {
      equipmentId: number;
      equipmentName: string;
      quantity: number;
      uri: string;
    }[];
    items?: {
      itemId: number;
      itemName: string;
      quantity: number;
      uri: string;
    }[];
    slimes?: SlimeWithTraits[];
    farmingExpGained?: number;
    farmingLevelsGained?: number;
    craftingExpGained?: number;
    craftingLevelsGained?: number;
    monstersKilled?: { name: string; uri: string; quantity: number }[];
    expGained?: number;
    levelsGained?: number;
    hpExpGained?: number;
    hpLevelsGained?: number;
    dittoGained?: string;
    userDied?: boolean;
    goldGained?: number;
  };
}

// Context
interface SkillContext {
  farmingStatuses: Record<number, FarmingStatus | null>;
  offlineProgressUpdatesReceived: boolean;
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
  offlineProgressUpdatesReceived: false,
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
  const { addNotification } = useNotification();
  const { accessGranted } = useLoginSocket();
  const { userData, userEfficiencyStats } = useUserSocket();
  const { setCurrentActivity } = useCurrentActivityContext();

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
      [itemId]: { startTimestamp, durationS: durationS * (1 - userEfficiencyStats.skillIntervalMultiplier) },
    });
    console.log(`Started farming for item ID ${itemId}`);
  };

  const stopFarming = (itemId: number) => {
    setFarmingStatuses((prevStatuses) => ({
      ...prevStatuses,
      [itemId]: null,
    }));
    setCurrentActivity(null);
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
      [equipmentId]: { startTimestamp, durationS: durationS * (1 - userEfficiencyStats.skillIntervalMultiplier) },
    });
    console.log(`Started crafting for equipment ID ${equipmentId}`);
  };

  const stopCrafting = (equipmentId: number) => {
    setCraftingStatuses((prevStatuses) => ({
      ...prevStatuses,
      [equipmentId]: null,
    }));
    setCurrentActivity(null);
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

      setCurrentActivity({
        type: "breeding",
        name: `Breeding Slime #${slimeToBreed0.id} and #${slimeToBreed1.id}`,
        sireId: slimeToBreed0.id,
        dameId: slimeToBreed1.id,
        startTimestamp,
        durationS,
        imgsrc1: slimeToBreed0.imageUri,
        imgsrc2: slimeToBreed1.imageUri,
      });
    }

    console.log(
      `Started breeding for slimes ${slimeToBreed0?.id} and ${slimeToBreed1?.id}`
    );
  };

  const stopBreeding = () => {
    setBreedingStatus(undefined);
    setCurrentActivity(null);
    console.log(`Stopped breeding.`);
  };

  // Temporary state for unresolved IDs
  const [unresolvedSireId, setUnresolvedSireId] = useState<number | null>(null);
  const [unresolvedDameId, setUnresolvedDameId] = useState<number | null>(null);

  const [offlineProgressUpdatesReceived, setOfflineProgressUpdatesReceived] =
    useState(false);

  useEffect(() => {
    if (socket && !loadingSocket) {
      // Move onAny to the top for debugging
      socket.onAny((eventName, ...args) => {
        if (eventName === "idle-progress-update") {
          console.log(
            `🎯 IDLE PROGRESS RAW DATA:`,
            JSON.stringify(args, null, 2)
          );
        }
        console.log(`📡 Received event: ${eventName}`, args);
      });

      // Farming
      socket.on("farming-start", (data: FarmingStartPayload) => {
        console.log(`Received farming-start: ${JSON.stringify(data, null, 2)}`);
        setFarmingStatuses((prevStatuses) => {
          if (
            prevStatuses[data.itemId] !== undefined &&
            prevStatuses[data.itemId] !== null
          ) {
            return prevStatuses;
          }

          return {
            ...prevStatuses,
            [data.itemId]: {
              startTimestamp: data.startTimestamp + 200,
              durationS: data.durationS,
            },
          };
        });
        setCurrentActivity({
          type: "farming",
          id: data.itemId,
          name: data.name,
          startTimestamp: data.startTimestamp,
          durationS: data.durationS,
          imgsrc1: data.imgsrc,
        });
      });

      socket.on("farming-stop", (data: FarmingStopPayload) => {
        console.log(`Received farming-stop: ${JSON.stringify(data, null, 2)}`);
        setFarmingStatuses((prevStatuses) => ({
          ...prevStatuses,
          [data.itemId]: null,
        }));
        setCurrentActivity((prev) => {
          if (prev?.type === "farming" && prev.id === data.itemId) {
            console.log("stopping farming current activity");
            return null;
          }
          return prev;
        });
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
        setCurrentActivity({
          type: "crafting",
          id: data.equipmentId,
          name: data.name,
          startTimestamp: data.startTimestamp,
          durationS: data.durationS,
          imgsrc1: data.imgsrc,
        });
      });

      socket.on("crafting-stop", (data: CraftingStopPayload) => {
        console.log(`Received crafting-stop: ${JSON.stringify(data, null, 2)}`);
        setCraftingStatuses((prevStatuses) => ({
          ...prevStatuses,
          [data.equipmentId]: null,
        }));
        setCurrentActivity((prev) => {
          if (prev?.type === "crafting" && prev.id === data.equipmentId) {
            console.log("stopping crafting current activity");
            return null;
          }
          return prev;
        });
      });

      // Breeding
      socket.on("breeding-start", (data: BreedingStatus) => {
        console.log(
          `Received breeding-start: ${JSON.stringify(data, null, 2)}`
        );
        setBreedingStatus(data);

        const sire = userData.slimes?.find(
          (element) => element.id === data.sireId
        );
        if (sire) setSlimeToBreed0(sire);
        else setUnresolvedSireId(data.sireId);

        const dame = userData.slimes?.find(
          (element) => element.id === data.dameId
        );
        if (dame) setSlimeToBreed1(dame);
        else setUnresolvedDameId(data.dameId);

        setCurrentActivity({
          type: "breeding",
          name: `Breeding Slime`,
          sireId: sire ? sire.id : -1,
          dameId: dame ? dame.id : -1,
          startTimestamp: data.startTimestamp,
          durationS: data.durationS,
          imgsrc1: DQLogo,
          imgsrc2: DQLogo,
        });
      });

      socket.on("breeding-stop", (data: { sireId: number; dameId: number }) => {
        console.log(`Received breeding-stop: ${JSON.stringify(data, null, 2)}`);
        setBreedingStatus(undefined);

        setCurrentActivity((prev) => {
          if (
            prev?.type === "breeding" &&
            prev?.sireId === data.sireId &&
            prev?.dameId === data.dameId
          ) {
            console.log("stopping breeding current activity");
            return null;
          }
          return prev;
        });
      });

      socket.on(
        "idle-progress-update",
        (data: { updates: ProgressUpdate[]; offlineProgressMs: number }) => {
          console.log(
            `🎯 Received idle-progress-update handler called:`,
            JSON.stringify(data, null, 2)
          );

          // ✅ ALWAYS set this to true when event is received
          setOfflineProgressUpdatesReceived(true);

          // Signal to login-context that skill context is ready
          if ((window as any).setSkillContextReady) {
            (window as any).setSkillContextReady();
          }

          // Only show notification if there are meaningful updates
          if (data.updates && data.updates.length > 0) {
            const hasMeaningfulProgress = data.updates.some((update) => {
              if (update.type !== "combat") return true;

              const combat = update.update;
              return (
                combat.userDied ||
                (combat.monstersKilled?.length ?? 0) > 0 ||
                (combat.items?.length ?? 0) > 0 ||
                (combat.equipment?.length ?? 0) > 0 ||
                (combat.expGained ?? 0) > 0 ||
                (combat.hpExpGained ?? 0) > 0 ||
                (combat.levelsGained ?? 0) > 0 ||
                (combat.hpLevelsGained ?? 0) > 0 ||
                combat.dittoGained !== "0" ||
                (combat.goldGained ?? 0) > 0
              );
            });

            if (hasMeaningfulProgress) {
              addNotification(() => (
                <OfflineProgressNotification
                  updates={data.updates}
                  offlineProgressMs={data.offlineProgressMs}
                />
              ));
            }
          }
        }
      );

      return () => {
        socket.offAny();
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
    let sire;
    let dame;

    if (unresolvedSireId && userData.slimes) {
      sire = userData.slimes.find((slime) => slime.id === unresolvedSireId);
      if (sire) {
        setSlimeToBreed0(sire);
        setUnresolvedSireId(null); // Clear temporary storage
      }
    }

    if (unresolvedDameId && userData.slimes) {
      dame = userData.slimes.find((slime) => slime.id === unresolvedDameId);
      if (dame) {
        setSlimeToBreed1(dame);
        setUnresolvedDameId(null); // Clear temporary storage
      }
    }

    if (sire && dame) {
      setCurrentActivity((prev) => {
        if (prev && prev.type === "breeding") {
          // If already breeding, update the images and IDs
          return {
            ...prev,
            imgsrc1: sire.imageUri,
            imgsrc2: dame.imageUri,
            sireId: sire.id,
            dameId: dame.id,
          };
        } else {
          // Else create new breeding activity
          return {
            type: "breeding",
            name: "Breeding Slimes",
            sireId: sire.id,
            dameId: dame.id,
            startTimestamp: Date.now(),
            durationS: 0,
            imgsrc1: sire.imageUri ?? DQLogo,
            imgsrc2: dame.imageUri ?? DQLogo,
          };
        }
      });
    }
  }, [unresolvedSireId, unresolvedDameId, userData.slimes]);

  return (
    <SkillContext.Provider
      value={{
        offlineProgressUpdatesReceived,
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
