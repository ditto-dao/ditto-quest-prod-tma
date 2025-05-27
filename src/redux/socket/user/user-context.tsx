import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Combat,
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
import {
  removeUndefined,
  updateUserStatsFromEquipmentAndSlime,
} from "../../../utils/helpers";
import {
  COMBAT_EXP_UPDATE_EVENT,
  FIRST_LOGIN_EVENT,
  USE_REFERRAL_CODE_SUCCESS,
} from "../../../utils/events";
import { useNotification } from "../../../components/notifications/notification-context";
import LevelUpNotification from "../../../components/notifications/notification-content/level-up/level-up-notification";
import ErrorNotification from "../../../components/notifications/notification-content/error/error-notification";
import { SlimeGachaPullRes } from "../gacha/gacha-context";
import FirstLoginNotification from "../../../components/notifications/notification-content/first-login/first-login";
import { useFloatingUpdate } from "../idle/floating-update-context";
import GoldIcon from "../../../assets/images/general/gold-coin.png";
import DittoCoinIcon from "../../../assets/images/general/ditto-coin.png";
import GenericSlime from "../../../assets/images/general/generic-pixel-slime.png";
import HPIcon from "../../../assets/images/combat/hp-lvl.png";
import GoldMedalIcon from "../../../assets/images/combat/gold-medal.png";
import FarmingIcon from "../../../assets/images/sidebar/farm.png";
import CraftingIcon from "../../../assets/images/sidebar/craft.png";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS } from "../../../utils/config";
import TextNotification from "../../../components/notifications/notification-content/text-notification/text-notification";

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

interface IncrementExpAndHpExpResponse {
  levelUp: boolean;
  level: number;
  exp: number;
  expToNextLevel: number;
  outstandingSkillPoints: number;

  hpLevelUp: boolean;
  hpLevel: number;
  hpExp: number;
  expToNextHpLevel: number;
}

interface StatsToPumpPayload {
  str?: number;
  def?: number;
  dex?: number;
  luk?: number;
  magic?: number;
  hpLevel?: number;
}

// Context
interface UserContext {
  userData: User;
  dittoBalance: DittoBalanceBN;
  userContextLoaded: boolean;
  equip: (inventoryId: number, equipmentType: EquipmentType) => void;
  unequip: (equipmentType: EquipmentType) => void;
  equipSlime: (slime: SlimeWithTraits) => void;
  unequipSlime: () => void;
  incrementUserHp: (amount: number) => void;
  setUserHp: (hp: number, maxHp: number) => void;
  isUpgradingStats: boolean;
  pumpStats: (stats: StatsToPumpPayload) => void;
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
  equipSlime: () => {},
  unequipSlime: () => {},
  incrementUserHp: () => {},
  setUserHp: () => {},
  isUpgradingStats: false,
  pumpStats: () => {},
  canEmitEvent: () => false,
  setLastEventEmittedTimestamp: () => {},
});

export const useUserSocket = () => useContext(UserContext);

export const UserProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { addNotification } = useNotification();
  const { addFloatingUpdate } = useFloatingUpdate();

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

  // upgrade stats
  const [isUpgradingStats, setIsUpgradingStats] = useState(false);

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
        addFloatingUpdate({
          icon: update.equipment?.imgsrc ?? update.item?.imgsrc!,
          text: update.equipment?.name ?? update.item?.name!,
          amount: inventory[indexToRemove].quantity,
        });
        inventory.splice(indexToRemove, 1);
        console.log(`Removed ${idKey} ${idToMatch} from inventory.`);
      }
    } else {
      // Find and replace or add the updated item/equipment
      const existingIndex = inventory.findIndex(
        (entry) => entry[idKey] === idToMatch
      );
      if (existingIndex !== -1) {
        const quantityDiff =
          update.quantity - inventory[existingIndex].quantity;

        inventory[existingIndex] = update; // Replace the existing entry
        console.log(`Updated ${idKey} ${idToMatch} in inventory.`);

        if (quantityDiff !== 0) {
          addFloatingUpdate({
            icon: update.equipment?.imgsrc ?? update.item?.imgsrc!,
            text: update.equipment?.name ?? update.item?.name!,
            amount: quantityDiff,
          });
        }
      } else {
        inventory.push(update); // Add as a new entry
        console.log(`Added ${idKey} ${idToMatch} to inventory.`);

        addFloatingUpdate({
          icon: update.equipment?.imgsrc ?? update.item?.imgsrc!,
          text: update.equipment?.name ?? update.item?.name!,
          amount: update.quantity,
        });
      }
    }
  }

  const equip = (inventoryId: number, equipmentType: EquipmentType) => {
    if (!socket || !canEmitEvent()) return;

    let didEquip = false;

    setUserData((prevUserData) => {
      console.log(`Inventory ID: ${inventoryId}`);
      console.log(`Current Inventory:`, prevUserData.inventory);

      const inventoryEntry = prevUserData.inventory.find(
        (entry) => entry.id === inventoryId
      );

      if (!inventoryEntry) {
        console.error(`Inventory entry with ID ${inventoryId} not found.`);
        return prevUserData;
      }

      console.log(`Found Inventory Entry:`, inventoryEntry);

      const isEquipment =
        inventoryEntry.equipment &&
        !inventoryEntry.item &&
        !inventoryEntry.itemId;

      if (isEquipment) {
        if (inventoryEntry.equipment!.requiredLvl > userData.level) {
          console.error(
            `User does not meet level requirements to equip ${
              inventoryEntry.equipment!.name
            }`
          );
          return prevUserData;
        }

        console.log(`Equipping item of type ${equipmentType}`);

        didEquip = true;

        const updatedUser = {
          ...prevUserData,
          [equipmentType]: inventoryEntry,
        };

        if (updatedUser.combat) {
          updateUserStatsFromEquipmentAndSlime(updatedUser, updatedUser.combat);
        } else {
          console.warn("Combat data missing — cannot update stats.");
        }

        return updatedUser;
      } else {
        console.warn(`Cannot equip: Entry is not a valid equipment.`);
        return prevUserData;
      }
    });

    if (didEquip) {
      socket.emit("equip-equipment", inventoryId);
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  const unequip = (equipmentType: EquipmentType) => {
    if (!socket || !canEmitEvent()) return;

    setUserData((prevUserData) => {
      const equippedEntry = prevUserData[equipmentType];

      if (!equippedEntry) {
        console.error(`Equipped slot for ${equipmentType} is empty.`);
        return prevUserData;
      }

      console.log(`Unequipping ${equipmentType}`, equippedEntry);

      const updatedUser = {
        ...prevUserData,
        [equipmentType]: null,
      };

      // Recalculate stats only if combat exists
      if (updatedUser.combat) {
        updateUserStatsFromEquipmentAndSlime(updatedUser, updatedUser.combat);
      }

      // Emit only on successful unequip
      socket.emit("unequip-equipment", equipmentType);
      setLastEventEmittedTimestamp(Date.now());

      return updatedUser;
    });
  };

  const equipSlime = (slime: SlimeWithTraits) => {
    if (!socket || !canEmitEvent()) return;

    if (slime.ownerId !== userData.telegramId) {
      console.error(`User does not own this slime!`);
      return;
    }

    console.log(`Equipping slime: ${slime.id}`);

    setUserData((prevUserData) => {
      const updatedUser = {
        ...prevUserData,
        equippedSlimeId: slime.id,
        equippedSlime: slime,
      };

      if (updatedUser.combat) {
        updateUserStatsFromEquipmentAndSlime(updatedUser, updatedUser.combat);
      }

      return updatedUser;
    });

    socket.emit("equip-slime", slime.id);
    setLastEventEmittedTimestamp(Date.now());
  };

  const unequipSlime = () => {
    if (!socket || !canEmitEvent()) return;

    if (!userData.equippedSlimeId || !userData.equippedSlime) {
      console.warn(`No slime is currently equipped.`);
      return;
    }

    console.log(`Unequipping slime ID: ${userData.equippedSlimeId}`);

    setUserData((prevUserData) => {
      const updatedUser = {
        ...prevUserData,
        equippedSlimeId: null,
        equippedSlime: null,
      };

      if (updatedUser.combat) {
        updateUserStatsFromEquipmentAndSlime(updatedUser, updatedUser.combat);
      }

      return updatedUser;
    });

    socket.emit("unequip-slime");
    setLastEventEmittedTimestamp(Date.now());
  };

  const incrementUserHp = (amount: number) => {
    setUserData((prevUserData) => {
      if (!prevUserData) {
        console.error(`User data not found. Unable to run incrementUserHp()`);
        return prevUserData;
      }

      if (!prevUserData.combat) {
        console.error(`User combat not found. Unable to run incrementUserHp()`);
        return prevUserData;
      }

      const { hp, maxHp } = prevUserData.combat;
      const newHp = Math.max(0, Math.min(maxHp, hp + amount));

      return {
        ...prevUserData,
        combat: {
          ...prevUserData.combat,
          hp: newHp,
        },
      };
    });
  };

  const setUserHp = (hp: number, maxHp: number) => {
    setUserData((prevUserData) => {
      if (!prevUserData) {
        console.error(`User data not found. Unable to run setUserHp()`);
        return prevUserData;
      }

      if (!prevUserData.combat) {
        console.error(`User combat not found. Unable to run setUserHp()`);
        console.log(`user combat: ${prevUserData.combat}`);
        return prevUserData;
      }

      return {
        ...prevUserData,
        combat: {
          ...prevUserData.combat,
          hp,
          maxHp,
        },
      };
    });
  };

  const pumpStats = (statsToPump: StatsToPumpPayload) => {
    if (!socket || !canEmitEvent()) return;

    // Remove keys with value 0 or undefined
    const filteredStats = Object.fromEntries(
      Object.entries(statsToPump).filter(([_, v]) => v && v > 0)
    ) as StatsToPumpPayload;

    if (Object.keys(filteredStats).length === 0) return;

    console.log(`pumping stats: ${JSON.stringify(filteredStats, null, 2)}`);

    setUserData((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        outstandingSkillPoints:
          prev.outstandingSkillPoints -
          (statsToPump.str || 0) -
          (statsToPump.def || 0) -
          (statsToPump.dex || 0) -
          (statsToPump.luk || 0) -
          (statsToPump.magic || 0) -
          (statsToPump.hpLevel || 0),
        str: prev.str + (statsToPump.str || 0),
        def: prev.def + (statsToPump.def || 0),
        dex: prev.dex + (statsToPump.dex || 0),
        luk: prev.luk + (statsToPump.luk || 0),
        magic: prev.magic + (statsToPump.magic || 0),
        hpLevel: prev.hpLevel + (statsToPump.hpLevel || 0),
      };

      return updated;
    });

    socket.emit("pump-stats", filteredStats);
    setLastEventEmittedTimestamp(Date.now());
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

      socket.on("user-update", (partialUpdate: Partial<User>) => {
        const cleanPartialupdate = removeUndefined(partialUpdate);
        console.log("Received user-update:", cleanPartialupdate);

        setUserData((prev) => {
          if (!prev) return prev;

          if (
            partialUpdate.goldBalance &&
            prev.goldBalance !== partialUpdate.goldBalance
          ) {
            addFloatingUpdate({
              icon: GoldIcon,
              text: "GP",
              amount: partialUpdate.goldBalance - prev.goldBalance,
            });
          }

          const updated = {
            ...prev,
            ...cleanPartialupdate,
            // If inventory is updated, sort it
            inventory: cleanPartialupdate.inventory
              ? [...cleanPartialupdate.inventory].sort(
                  (a, b) => a.order - b.order
                )
              : prev.inventory,
          };

          return updated;
        });
      });

      socket.on(
        "ditto-ledger-socket-balance-update",
        (balance: UserBalanceUpdateRes) => {
          console.log(`liveBalance: ${balance.liveBalance}`);
          console.log(`accumulatedBalance: ${balance.accumulatedBalance}`);
          console.log(`isBot: ${balance.isBot}`);
          console.log(`isAdmin: ${balance.isAdmin}`);

          if (
            BigInt(balance.accumulatedBalanceChange) +
              BigInt(balance.liveBalanceChange) !==
              0n &&
            dittoBalanceLoaded
          ) {
            addFloatingUpdate({
              icon: DittoCoinIcon,
              text: "DITTO",
              amount: Number(
                formatUnits(
                  BigInt(balance.accumulatedBalanceChange) +
                    BigInt(balance.liveBalanceChange),
                  DITTO_DECIMALS
                )
              ),
            });
          }

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
        socket.off("user-update");
        socket.off("ditto-ledger-socket-balance-update");
      };
    }
  }, [socket, loadingSocket, dittoBalanceLoaded]);

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

          addFloatingUpdate({
            icon: GenericSlime,
            text: `Slime #${slime.id}`,
            amount: 1,
          });

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
          if (data.farmingLevelsGained <= 0) {
            addFloatingUpdate({
              icon: FarmingIcon,
              text: "Farming EXP",
              amount: data.farmingExp - prevUserData.farmingExp,
            });
          }

          return {
            ...prevUserData,
            farmingExp: data.farmingExp,
            farmingLevel: data.farmingLevel,
            expToNextFarmingLevel: data.expToNextFarmingLevel,
          };
        });

        if (data.farmingLevelsGained > 0) {
          addNotification(() => (
            <LevelUpNotification
              newLevel={data.farmingLevel}
              lvlLabel="Farming Lvl"
            />
          ));
        }
      });

      socket.on("update-crafting-exp", (data: CraftingExpPayload) => {
        console.log(
          `Received update-crafting-exp: ${JSON.stringify(data, null, 2)}`
        );
        setUserData((prevUserData) => {
          if (data.craftingLevelsGained <= 0) {
            addFloatingUpdate({
              icon: CraftingIcon,
              text: "Crafting EXP",
              amount: data.craftingExp - prevUserData.craftingExp,
            });
          }

          return {
            ...prevUserData,
            craftingExp: data.craftingExp,
            craftingLevel: data.craftingLevel,
            expToNextCraftingLevel: data.expToNextCraftingLevel,
          };
        });

        if (data.craftingLevelsGained > 0) {
          addNotification(() => (
            <LevelUpNotification
              newLevel={data.craftingLevel}
              lvlLabel="Crafting Lvl"
            />
          ));
        }
      });

      socket.on("equip-slime-update", (slime: SlimeWithTraits | null) => {
        console.log(`Received equip-slime-update: ${slime}`);

        setUserData((prev) => {
          return {
            ...prev,
            equippedSlimeId: slime?.id,
            equippedSlime: slime,
          };
        });
      });

      socket.on("combat-update", (partialUpdate: Partial<Combat>) => {
        const cleanPartialupdate = removeUndefined(partialUpdate);
        console.log("Received combat-update:", cleanPartialupdate);

        setUserData((prev) => {
          if (!prev || !prev.combat) return prev;

          const updatedCombat = {
            ...prev.combat,
            ...cleanPartialupdate,
          };

          return {
            ...prev,
            combat: updatedCombat,
          };
        });
      });

      socket.on(
        COMBAT_EXP_UPDATE_EVENT,
        (data: IncrementExpAndHpExpResponse) => {
          console.log(
            `Received COMBAT_EXP_UPDATE_EVENT: ${JSON.stringify(data, null, 2)}`
          );

          if (!userData) {
            console.error(
              `User data not found. Unable to process COMBAT_EXP_UPDATE_EVENT`
            );
            return;
          }

          setUserData((prev) => {
            if (prev.expHp !== data.hpExp && !data.hpLevelUp) {
              addFloatingUpdate({
                icon: HPIcon,
                text: "HP EXP",
                amount: data.hpExp - prev.expHp,
              });
            }

            if (prev.exp !== data.exp && !data.levelUp) {
              addFloatingUpdate({
                icon: GoldMedalIcon,
                text: "EXP",
                amount: data.exp - prev.exp,
              });
            }
            return {
              ...prev,
              level: data.level,
              exp: data.exp,
              expToNextLevel: data.expToNextLevel,
              outstandingSkillPoints: data.outstandingSkillPoints,
              hpLevel: data.hpLevel,
              expHp: data.hpExp,
              expToNextHpLevel: data.expToNextHpLevel,
            };
          });

          if (data.levelUp) {
            addNotification(() => (
              <LevelUpNotification newLevel={data.level} lvlLabel="Lvl" />
            ));
          }

          if (data.hpLevelUp) {
            addNotification(() => (
              <LevelUpNotification newLevel={data.hpLevel} lvlLabel="HP Lvl" />
            ));
          }
        }
      );

      socket.on("pump-stats-complete", () => {
        setIsUpgradingStats(false);
      });

      socket.on(
        FIRST_LOGIN_EVENT,
        (payload: {
          freeSlimes: SlimeGachaPullRes[];
          freeItems: Inventory[];
        }) => {
          addNotification(() => (
            <FirstLoginNotification
              freeSlimes={payload.freeSlimes}
              freeItems={payload.freeItems}
            />
          ));
        }
      );

      socket.on(
        USE_REFERRAL_CODE_SUCCESS,
        (data: { referredBy: string | null; isUserReferrer: boolean }) => {
          console.log(`USE_REFERRAL_CODE_SUCCESS: ${data}`);
          addNotification(() => (
            <TextNotification
              header={"Referral Link Applied"}
              msg={
                "You have successfully used a DQ referral link. Enjoy a 10% increase in DITTO earnings!"
              }
            />
          ));
        }
      );

      socket.on("error", (msg: string) => {
        addNotification(() => <ErrorNotification msg={msg} />);
      });

      // Clean up on unmount
      return () => {
        socket.off("update-inventory");
        socket.off("update-slime-inventory");
        socket.off("unequip-update");
        socket.off("equip-update");
        socket.off("update-farming-exp");
        socket.off("update-crafting-exp");
        socket.off("equip-slime-update");
        socket.off("combat-update");
        socket.off(COMBAT_EXP_UPDATE_EVENT);
        socket.off("pump-stats-complete");
        socket.off(FIRST_LOGIN_EVENT);
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
        equipSlime,
        unequipSlime,
        incrementUserHp,
        setUserHp,
        isUpgradingStats,
        pumpStats,
        canEmitEvent,
        setLastEventEmittedTimestamp,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
