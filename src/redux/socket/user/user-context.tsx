import React, { createContext, useContext, useEffect, useState } from "react";
import {
  defaultUser,
  DittoBalanceBN,
  EquipmentType,
  Inventory,
  SlimeWithTraits,
  SocketProviderProps,
  User,
} from "../../../utils/types";
import { useSocket } from "../socket-context";
import { useLoginSocket } from "../login/login-context";

interface FarmingExpPayload {
  farmingLevel: number;
  farmingLevelsGained: number;
  farmingExp: number;
  expToNextFarmingLevel: number;
}

interface CraftingExpPayload {
  craftingLevel: number;
  craftingLevelsGained: number;
  craftingExp: number;
  expToNextCraftingLevel: number;
}

export interface UserBalanceUpdateRes {
  liveBalance: string;
  accumulatedBalance: string;
  isBot: boolean;
  isAdmin: boolean;
  liveBalanceChange: string;
  accumulatedBalanceChange: string;
  updatedAt?: Date; // if notes, must have updatedAt
  notes?: string;
}

// Context
interface UserContext {
  userData: User;
  dittoBalance: DittoBalanceBN;
  userContextLoaded: boolean;
  equip: (inventoryId: number, equipmentType: EquipmentType) => void;
  unequip: (equipmentType: EquipmentType) => void;
  canEmitEvent: () => boolean;
  setLastEventEmittedTimestamp: React.Dispatch<React.SetStateAction<number>>;
}

const UserContext = createContext<UserContext>({
  userData: defaultUser,
  dittoBalance: {
    liveBalance: 0n,
    accumulatedBalance: 0n,
    isBot: false,
    isAdmin: false,
  },
  userContextLoaded: false,
  equip: () => {},
  unequip: () => {},
  canEmitEvent: () => false,
  setLastEventEmittedTimestamp: () => {},
});

export const useUserSocket = () => useContext(UserContext);

export const UserProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();

  // User
  const [userData, setUserData] = useState<User>(defaultUser);
  const [userLoaded, setUserLoaded] = useState(false); // no need export
  const [userContextLoaded, setUserContextLoaded] = useState(false);

  // Ditto balance
  const [dittoBalance, setDittoBalance] = useState<DittoBalanceBN>({
    liveBalance: 0n,
    accumulatedBalance: 0n,
    isBot: false,
    isAdmin: false,
  });
  const [dittoBalanceLoaded, setDittoBalanceLoaded] = useState(false); // no need export

  // Prevent click spam
  const [lastEventEmittedTimestamp, setLastEventEmittedTimestamp] = useState(0);

  function processInventoryUpdate(
    inventory: Inventory[],
    update: Inventory,
    idKey: "itemId" | "equipmentId"
  ) {
    const idToMatch = update[idKey];

    if (update.quantity === 0) {
      // Remove item/equipment with quantity 0
      const indexToRemove = inventory.findIndex(
        (entry) => entry[idKey] === idToMatch
      );
      if (indexToRemove !== -1) {
        inventory.splice(indexToRemove, 1);
        console.log(`Removed ${idKey} ${idToMatch} from inventory.`);
      }
    } else {
      // Find and replace or add the updated item/equipment
      const existingIndex = inventory.findIndex(
        (entry) => entry[idKey] === idToMatch
      );
      if (existingIndex !== -1) {
        inventory[existingIndex] = update; // Replace the existing entry
        console.log(`Updated ${idKey} ${idToMatch} in inventory.`);
      } else {
        inventory.push(update); // Add as a new entry
        console.log(`Added ${idKey} ${idToMatch} to inventory.`);
      }
    }
  }

  const equip = (inventoryId: number, equipmentType: EquipmentType) => {
    if (socket) {
      if (!canEmitEvent()) return;

      setUserData((prevUserData) => {
        console.log(`Inventory ID: ${inventoryId}`);
        console.log(`Current Inventory:`, prevUserData.inventory);

        // Find the inventory entry with the matching inventoryId
        const inventoryEntry = prevUserData.inventory.find(
          (entry) => entry.id === inventoryId
        );

        if (!inventoryEntry) {
          console.error(`Inventory entry with ID ${inventoryId} not found.`);
          return prevUserData; // Return unchanged user data if entry not found
        }

        console.log(`Found Inventory Entry:`, inventoryEntry);

        // Check if the inventory entry is equipment (no item and no itemId)
        if (!inventoryEntry.item && !inventoryEntry.itemId) {
          console.log(`Equipping item of type ${equipmentType}`);
          return {
            ...prevUserData,
            [equipmentType]: inventoryEntry, // Set the equipment type to the found entry
          };
        } else {
          console.log(`Cannot equip: Inventory entry is not equipment.`);
          return prevUserData; // Return unchanged user data if not equippable
        }
      });
      socket.emit("equip-equipment", inventoryId);
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  const unequip = (equipmentType: EquipmentType) => {
    if (socket) {
      if (!canEmitEvent()) return;

      setUserData((prevUserData) => {
        const equippedEntry = prevUserData[equipmentType];

        if (!equippedEntry) {
          console.error(`Equipped slot for ${equipmentType} empy.`);
          return prevUserData;
        }

        console.log(`Found Equipped slot for ${equipmentType}`);
        console.log(`Unequipping ${equipmentType}`);

        return {
          ...prevUserData,
          [equipmentType]: null,
        };
      });
      socket.emit("unequip-equipment", equipmentType);
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  const canEmitEvent = () => {
    return Date.now() - lastEventEmittedTimestamp >= 500;
  };

  useEffect(() => {
    // Listener for login
    if (socket && !loadingSocket) {
      socket.on("user-data-on-login", (userData: User) => {
        console.log(`received user-data-on-login`);
        console.log(JSON.stringify(userData, null, 2));

        // Sort the inventory by the `order` field
        const sortedInventory = [...userData.inventory].sort(
          (a, b) => a.order - b.order
        );

        // Replace the original inventory with the sorted version
        const sortedUserData = {
          ...userData,
          inventory: sortedInventory,
        };

        setUserData(sortedUserData);
        setUserLoaded(true);
      });

      socket.on(
        "ditto-ledger-socket-balance-update",
        (balance: UserBalanceUpdateRes) => {
          console.log(`liveBalance: ${balance.liveBalance}`);
          console.log(`accumulatedBalance: ${balance.accumulatedBalance}`);
          console.log(`isBot: ${balance.isBot}`);
          console.log(`isAdmin: ${balance.isAdmin}`);

          setDittoBalance({
            accumulatedBalance: BigInt(balance.accumulatedBalance),
            liveBalance: BigInt(balance.liveBalance),
            isBot: balance.isBot,
            isAdmin: balance.isAdmin,
          });
          if (!dittoBalanceLoaded) setDittoBalanceLoaded(true);

          if (
            (BigInt(balance.liveBalanceChange) > 0n ||
              BigInt(balance.accumulatedBalanceChange) > 0n) &&
            balance.notes
          ) {
            // todo: notification balance change
          }
        }
      );

      // Clean up on unmount
      return () => {
        socket.off("user-data-on-login");
        socket.off("ditto-ledger-socket-balance-update");
      };
    }
  }, [socket, loadingSocket]);

  useEffect(() => {
    if (!userContextLoaded) return;

    // Update username field
    if (!userData.username) userData.username = `user_${userData.telegramId}`;
  }, [userData, userContextLoaded]);

  useEffect(() => {
    if (socket && !loadingSocket && accessGranted) {
      socket.on("update-inventory", (data: Inventory[]) => {
        setUserData((prevUserData) => {
          const updatedInventory = [...prevUserData.inventory];

          data.forEach((update) => {
            if (update.equipment && update.equipmentId && !update.item) {
              // Process equipment updates
              processInventoryUpdate(updatedInventory, update, "equipmentId");
            } else if (update.item && update.itemId && !update.equipment) {
              // Process item updates
              processInventoryUpdate(updatedInventory, update, "itemId");
            } else {
              console.error(
                `Erroneous update-inventory event: ${JSON.stringify(update)}`
              );
            }
          });

          return {
            ...prevUserData,
            inventory: updatedInventory,
          };
        });
      });

      socket.on("update-slime-inventory", (slime: SlimeWithTraits) => {
        setUserData((prevUserData) => {
          // Create a copy of the current itemInventory
          let updatedSlimes = prevUserData.slimes
            ? [...prevUserData.slimes]
            : [];

          return {
            ...prevUserData,
            slimes: [...updatedSlimes, slime],
          };
        });
      });

      socket.on("unequip-update", (inventoryId: number) => {
        setUserData((prevUserData) => {
          const inventoryEntry = prevUserData.inventory.find(
            (entry) => entry.id === inventoryId
          );

          if (
            !inventoryEntry ||
            !inventoryEntry.equipment ||
            !prevUserData[inventoryEntry.equipment.type]
          )
            return prevUserData;

          if (
            prevUserData[inventoryEntry.equipment.type]!.equipmentId ===
            inventoryEntry.equipmentId
          ) {
            return {
              ...prevUserData,
              [inventoryEntry.equipment.type]: null,
            };
          } else {
            return prevUserData;
          }
        });
      });

      socket.on("equip-update", (inventory: Inventory) => {
        setUserData((prevUserData) => {
          if (!inventory.equipment) {
            return prevUserData;
          } else {
            return {
              ...prevUserData,
              [inventory.equipment!.type]: inventory,
            };
          }
        });
      });

      socket.on("update-farming-exp", (data: FarmingExpPayload) => {
        console.log(
          `Received update-farming-exp: ${JSON.stringify(data, null, 2)}`
        );
        setUserData((prevUserData) => {
          return {
            ...prevUserData,
            farmingExp: data.farmingExp,
            farmingLevel: data.farmingLevel,
            expToNextFarmingLevel: data.expToNextFarmingLevel,
          };
        });

        if (data.farmingLevelsGained > 0) {
          console.log(`fuck yeah`); //!!!!!!!!!!!!!!!!!!!!!!! change alerts to a separate event !!!!!!!!!!!!!!!!!!!!!!!
        }
      });

      socket.on("update-crafting-exp", (data: CraftingExpPayload) => {
        console.log(
          `Received update-crafting-exp: ${JSON.stringify(data, null, 2)}`
        );
        setUserData((prevUserData) => {
          return {
            ...prevUserData,
            craftingExp: data.craftingExp,
            craftingLevel: data.craftingLevel,
            expToNextCraftingLevel: data.expToNextCraftingLevel,
          };
        });

        if (data.craftingLevelsGained > 0) {
          console.log(`fuck yeah`); //!!!!!!!!!!!!!!!!!!!!!!! change alerts to a separate event !!!!!!!!!!!!!!!!!!!!!!!
        }
      });

      socket.on("error", (msg: string) => {
        console.error(`${msg}`); //!!!!!!!!!!!!!!!!!!!!!!! change alerts to a separate event !!!!!!!!!!!!!!!!!!!!!!!
      });

      // Clean up on unmount
      return () => {
        socket.off("update-inventory");
        socket.off("update-slime-inventory");
        socket.off("unequip-update");
        socket.off("update-farming-exp");
        socket.off("update-crafting-exp");
        socket.off("error");
      };
    }
  }, [socket, loadingSocket, accessGranted]);

  useEffect(() => {
    if (userLoaded && dittoBalanceLoaded) setUserContextLoaded(true);
    console.log(`user context loaded`);
  }, [userLoaded]);

  return (
    <UserContext.Provider
      value={{
        userData,
        dittoBalance,
        userContextLoaded,
        equip,
        unequip,
        canEmitEvent,
        setLastEventEmittedTimestamp,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
