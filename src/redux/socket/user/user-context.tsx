import React, { createContext, useContext, useEffect, useState } from "react";
import {
  defaultUser,
  EquipmentType,
  Inventory,
  SlimeWithTraits,
  SocketProviderProps,
  User,
} from "../../../utils/types";
import { useSocket } from "../socket-context";
import { useLoginSocket } from "../login/login-context";

// Context
interface UserContext {
  userLoaded: boolean;
  userData: User;
  userContextLoaded: boolean;
  equip: (inventoryId: number, equipmentType: EquipmentType) => void;
}

const UserContext = createContext<UserContext>({
  userLoaded: false,
  userData: defaultUser,
  userContextLoaded: false,
  equip: () => {},
});

export const useUserSocket = () => useContext(UserContext);

export const UserProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();

  // User
  const [userData, setUserData] = useState<User>(defaultUser);
  const [userLoaded, setUserLoaded] = useState(false);

  const [userContextLoaded, setUserContextLoaded] = useState(false);

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
    }
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

      // Clean up on unmount
      return () => {
        socket.off("user-data-on-login");
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

      socket.on("slime-mint-update", (slime: SlimeWithTraits) => {
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
        alert(`Received Slime #${slime.id}!`); //!!!!!!!!!!!!!!!!!!!!!!! change alerts to a separate event !!!!!!!!!!!!!!!!!!!!!!!
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

      socket.on("error", (msg: string) => {
        console.error(`Socket error: ${msg}`);
      });

      // Clean up on unmount
      return () => {
        socket.off("update-inventory");
        socket.off("slime-mint-update");
        socket.off("unequip-update");
      };
    }
  }, [socket, loadingSocket, accessGranted]);

  useEffect(() => {
    if (userLoaded) setUserContextLoaded(true);
    console.log(`user context loaded`);
  }, [userLoaded]);

  return (
    <UserContext.Provider
      value={{
        userLoaded,
        userData,
        userContextLoaded,
        equip,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
