import React, { createContext, useContext, useEffect, useState } from "react";
import {
  defaultUser,
  EquipmentInventory,
  ItemInventory,
  SlimeWithTraits,
  SocketProviderProps,
  User,
} from "../../../utils/types";
import { useSocket } from "../socket-context";
import { useLoginSocket } from "../login/login-context";

interface ItemInventoryRes {
  itemInventory: ItemInventory;
  qtyReceived?: number;
}

interface EquipmentInventoryRes {
  equipmentInventory: EquipmentInventory;
  remove: boolean;
}

// Context
interface UserContext {
  userLoaded: boolean;
  userData: User;
  userContextLoaded: boolean;
}

const UserContext = createContext<UserContext>({
  userLoaded: false,
  userData: defaultUser,
  userContextLoaded: false,
});

export const useUserSocket = () => useContext(UserContext);

export const UserProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();

  // User
  const [userData, setUserData] = useState<User>(defaultUser);
  const [userLoaded, setUserLoaded] = useState(false);

  const [userContextLoaded, setUserContextLoaded] = useState(false);

  useEffect(() => {
    // Listener for login
    if (socket && !loadingSocket) {
      socket.on("user-data-on-login", (userData: User) => {
        console.log(`received user-data-on-login`);
        console.log(JSON.stringify(userData, null, 2));
        setUserData(userData);
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
      socket.on("update-item-inventory", (data: ItemInventoryRes[]) => {
        data.forEach((itemUpdate) => {
          if (itemUpdate.qtyReceived) {
            alert(
              `Received ${itemUpdate.itemInventory.item.name} x${itemUpdate.qtyReceived}!`
            ); //!!!!!!!!!!!!!!!!!!!!!!! change alerts to a separate event !!!!!!!!!!!!!!!!!!!!!!!
          }

          setUserData((prevUserData) => {
            // Create a copy of the current itemInventory
            let updatedInventory = [...prevUserData.itemInventory];
            let itemFound = false;

            // Check if the item quantity is 0 and remove it if necessary
            if (itemUpdate.itemInventory.quantity === 0) {
              updatedInventory = updatedInventory.filter(
                (item) => item.id !== itemUpdate.itemInventory.id
              );
              console.log(
                `Item with ID ${itemUpdate.itemInventory.id} has been removed from the inventory.`
              );
            } else {
              // Iterate through the inventory to find and replace the item if it exists
              for (let i = 0; i < updatedInventory.length; i++) {
                if (updatedInventory[i].id === itemUpdate.itemInventory.id) {
                  updatedInventory[i] = itemUpdate.itemInventory; // Replace the item
                  itemFound = true;
                  break;
                }
              }

              // If the item was not found, append it to the inventory
              if (!itemFound) {
                updatedInventory.push(itemUpdate.itemInventory);
              }
            }

            // Return the updated userData with the modified itemInventory
            return {
              ...prevUserData,
              itemInventory: updatedInventory,
            };
          });
        });
      });

      socket.on(
        "update-equipment-inventory",
        (data: EquipmentInventoryRes[]) => {
          data.forEach((equipmentUpdate) => {
            setUserData((prevUserData) => {
              // Create a copy of the current itemInventory
              let updatedInventory = [...prevUserData.equipmentInventory];
              if (equipmentUpdate.remove) {
                updatedInventory = updatedInventory.filter(
                  (equipment) =>
                    equipment.id !== equipmentUpdate.equipmentInventory.id
                );
                console.log(
                  `Equipment with ID ${equipmentUpdate.equipmentInventory.id} has been removed from the inventory.`
                );
              } else {
                updatedInventory.push(equipmentUpdate.equipmentInventory);
              }

              // Return the updated userData with the modified itemInventory
              return {
                ...prevUserData,
                equipmentInventory: updatedInventory,
              };
            });
          });
        }
      );

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

      // Clean up on unmount
      return () => {
        socket.off("update-item-inventory");
        socket.off("update-equipment-inventory");
        socket.off("slime-mint-update");
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
