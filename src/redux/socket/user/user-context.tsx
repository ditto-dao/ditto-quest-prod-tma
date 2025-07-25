import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Combat,
  defaultEfficiencyStats,
  defaultUser,
  DittoBalanceBN,
  EquipmentType,
  Inventory,
  SlimeWithTraits,
  SocketProviderProps,
  User,
  UserEfficiencyStats,
} from "../../../utils/types";
import { useSocket } from "../socket-context";
import { removeUndefined } from "../../../utils/helpers";
import {
  ADD_STICKERS_FOR_SLIME_SUCCESS,
  BETA_TESTER_LOGIN_EVENT,
  COMBAT_EXP_UPDATE_EVENT,
  EFFICIENCY_STATS_UPDATE_EVENT,
  FIRST_LOGIN_EVENT,
  STARS_INVOICE_CREATED_EVENT,
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
import ReferralSuccessNotification from "../../../components/notifications/notification-content/referral-notification/referral-notification";
import BetaTestersLoginNotif from "../../../components/notifications/notification-content/beta-testers-login/beta-testers-login";
import WebApp from "@twa-dev/sdk";
import PurchaseSuccessNotification from "../../../components/notifications/notification-content/purchase-success/purchase-success-notification";
import ElixerOfUnmakingIcon from "../../../assets/images/general/elixir-of-unmaking.png";
import SatcherDraughtIcon from "../../../assets/images/general/satchel-draught.png";
import SlimebondSerumIcon from "../../../assets/images/general/slimebond-serum.png";
import { preloadImageCached } from "../../../utils/image-cache";
import { FloatingUpdate } from "../../../components/floating-update-display/floating-update-display";
import LoginManager from "../../../managers/login-manager";

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
  userEfficiencyStats: UserEfficiencyStats;
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
  removeSlimeById: (slimeId: number) => void;
  canGenerateStickers: boolean;
  setCanGenerateStickers: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContext>({
  userData: defaultUser,
  userEfficiencyStats: defaultEfficiencyStats,
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
  removeSlimeById: () => {},
  canGenerateStickers: true,
  setCanGenerateStickers: () => {},
});

export const useUserSocket = () => useContext(UserContext);

export const UserProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket, loadingSocket } = useSocket();
  const { addNotification } = useNotification();
  const { addFloatingUpdate, addMultipleFloatingUpdates } = useFloatingUpdate();

  // User
  const [userData, setUserData] = useState<User>(defaultUser);
  const [userLoaded, setUserLoaded] = useState(false); // no need export
  const [userEfficiencyStats, setUserEfficiencyStats] =
    useState<UserEfficiencyStats>(defaultEfficiencyStats);
  const [userEfficiencyStatsLoaded, setUserEfficiencyStatsLoaded] =
    useState(false); // no need export
  const [userContextLoaded, setUserContextLoaded] = useState(false);
  const prevFarmingExpRef = useRef(userData.farmingExp);
  const prevCraftingExpRef = useRef(userData.craftingExp);

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
      const indexToRemove = inventory.findIndex(
        (entry) => entry[idKey] === idToMatch
      );
      if (indexToRemove !== -1) {
        // Capture the original item data BEFORE removing it
        const originalItem = inventory[indexToRemove];

        setTimeout(() => {
          addFloatingUpdate({
            icon: originalItem.equipment?.imgsrc ?? originalItem.item?.imgsrc!,
            text: originalItem.equipment?.name ?? originalItem.item?.name!,
            amount: -originalItem.quantity, // Negative because we're removing
          });
        }, 0);
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
          // ✅ Defer the floating update to avoid render warning
          setTimeout(() => {
            addFloatingUpdate({
              icon: update.equipment?.imgsrc ?? update.item?.imgsrc!,
              text: update.equipment?.name ?? update.item?.name!,
              amount: quantityDiff,
            });
          }, 0);
        }
      } else {
        inventory.push(update); // Add as a new entry
        console.log(`Added ${idKey} ${idToMatch} to inventory.`);

        setTimeout(() => {
          addFloatingUpdate({
            icon: update.equipment?.imgsrc ?? update.item?.imgsrc!,
            text: update.equipment?.name ?? update.item?.name!,
            amount: update.quantity,
          });
        }, 0);
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
        if (inventoryEntry.equipment!.requiredLvlCombat > userData.level) {
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

    if (userData.equippedSlimeId === slime.id) return;

    console.log(`Equipping slime: ${slime.id}`);

    setUserData((prevUserData) => {
      const updatedUser = {
        ...prevUserData,
        equippedSlimeId: slime.id,
        equippedSlime: slime,
      };

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

    // Remove keys with value 0 or undefined, but keep negative values
    const filteredStats = Object.fromEntries(
      Object.entries(statsToPump).filter(([_, v]) => v !== undefined && v !== 0)
    ) as StatsToPumpPayload;

    if (Object.keys(filteredStats).length === 0) return;

    console.log(`pumping stats: ${JSON.stringify(filteredStats, null, 2)}`);

    // Calculate points used for positive and negative changes
    const positiveChanges = Object.values(filteredStats)
      .filter((v) => v > 0)
      .reduce((sum, v) => sum + v, 0);
    const negativeChanges = Object.values(filteredStats)
      .filter((v) => v < 0)
      .reduce((sum, v) => sum + Math.abs(v), 0);

    // Set upgrading state immediately to prevent UI flickering
    setIsUpgradingStats(true);

    // Optimistically update user data - this is the key fix!
    setUserData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        // Update skill points (spent on positive changes)
        outstandingSkillPoints: prev.outstandingSkillPoints - positiveChanges,
        // Update reset points (spent on negative changes) - THIS WAS MISSING!
        statResetPoints: (prev.statResetPoints ?? 0) - negativeChanges,
        // Update individual stats
        str: prev.str + (statsToPump.str || 0),
        def: prev.def + (statsToPump.def || 0),
        dex: prev.dex + (statsToPump.dex || 0),
        luk: prev.luk + (statsToPump.luk || 0),
        magic: prev.magic + (statsToPump.magic || 0),
        hpLevel: prev.hpLevel + (statsToPump.hpLevel || 0),
      };
    });

    socket.emit("pump-stats", filteredStats);
    setLastEventEmittedTimestamp(Date.now());
  };
  const canEmitEvent = () => {
    return Date.now() - lastEventEmittedTimestamp >= 500;
  };

  const removeSlimeById = (slimeId: number) => {
    setUserData((prevUserData) => {
      if (!prevUserData || !prevUserData.slimes) return prevUserData;

      const updatedSlimes = prevUserData.slimes.filter(
        (slime) => slime.id !== slimeId
      );
      console.log(`Removed slime with ID ${slimeId}`);

      return {
        ...prevUserData,
        slimes: updatedSlimes,
      };
    });
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

          let goldDelta = 0;
          let statResetPointsDelta = 0;
          let maxInventorySlotsDelta = 0;
          let maxSlimeInventorySlotsDelta = 0;

          if (
            partialUpdate.goldBalance !== undefined &&
            prev.goldBalance !== partialUpdate.goldBalance
          ) {
            goldDelta = partialUpdate.goldBalance - prev.goldBalance;
          }

          if (
            partialUpdate.statResetPoints !== undefined &&
            prev.statResetPoints !== partialUpdate.statResetPoints
          ) {
            statResetPointsDelta =
              partialUpdate.statResetPoints - prev.statResetPoints;
          }

          if (
            partialUpdate.maxInventorySlots !== undefined &&
            prev.maxInventorySlots !== partialUpdate.maxInventorySlots
          ) {
            maxInventorySlotsDelta =
              partialUpdate.maxInventorySlots - prev.maxInventorySlots;
          }

          if (
            partialUpdate.maxSlimeInventorySlots !== undefined &&
            prev.maxSlimeInventorySlots !== partialUpdate.maxSlimeInventorySlots
          ) {
            maxSlimeInventorySlotsDelta =
              partialUpdate.maxSlimeInventorySlots -
              prev.maxSlimeInventorySlots;
          }

          // Process floating updates here, inside the callback
          setTimeout(() => {
            const pendingUpdates: Omit<FloatingUpdate, "id">[] = [];

            if (goldDelta !== 0) {
              pendingUpdates.push({
                icon: GoldIcon,
                text: "GP",
                amount: goldDelta,
              });
            }

            if (statResetPointsDelta !== 0) {
              pendingUpdates.push({
                icon: ElixerOfUnmakingIcon,
                text: "Elixir of Unmaking",
                amount: statResetPointsDelta,
              });
            }

            if (maxInventorySlotsDelta !== 0) {
              pendingUpdates.push({
                icon: SatcherDraughtIcon,
                text: "Inventory Slots",
                amount: maxInventorySlotsDelta,
              });
            }

            if (maxSlimeInventorySlotsDelta !== 0) {
              pendingUpdates.push({
                icon: SlimebondSerumIcon,
                text: "Slime Inventory Slots",
                amount: maxSlimeInventorySlotsDelta,
              });
            }

            if (pendingUpdates.length > 0) {
              addMultipleFloatingUpdates(pendingUpdates);
            }
          }, 0);

          return {
            ...prev,
            ...cleanPartialupdate,
            inventory: cleanPartialupdate.inventory
              ? [...cleanPartialupdate.inventory].sort(
                  (a, b) => a.order - b.order
                )
              : prev.inventory,
          };
        });
      });

      socket.on(
        EFFICIENCY_STATS_UPDATE_EVENT,
        (userEfficiencyStats: UserEfficiencyStats) => {
          console.log(
            `Received EFFICIENCY_STATS_UPDATE_EVENT: ${JSON.stringify(
              userEfficiencyStats,
              null,
              2
            )}`
          );
          setUserEfficiencyStats(userEfficiencyStats);
          setUserEfficiencyStatsLoaded(true);
        }
      );

      socket.on(
        "ditto-ledger-socket-balance-update",
        (balance: UserBalanceUpdateRes) => {
          console.log(`liveBalance: ${balance.liveBalance}`);
          console.log(`accumulatedBalance: ${balance.accumulatedBalance}`);
          console.log(`isBot: ${balance.isBot}`);
          console.log(`isAdmin: ${balance.isAdmin}`);

          // ✅ Defer the floating update to avoid render warning
          if (
            BigInt(balance.accumulatedBalanceChange) +
              BigInt(balance.liveBalanceChange) !==
            0n
          ) {
            setTimeout(() => {
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
            }, 0);
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
        socket.off(EFFICIENCY_STATS_UPDATE_EVENT);
      };
    }
  }, [socket, loadingSocket]);

  useEffect(() => {
    if (!userContextLoaded) return;

    // Update username field
    if (!userData.username) userData.username = `user_${userData.telegramId}`;
  }, [userData, userContextLoaded]);

  useEffect(() => {
    prevFarmingExpRef.current = userData.farmingExp;
    prevCraftingExpRef.current = userData.craftingExp;
  }, [userData.farmingExp, userData.craftingExp]);

  useEffect(() => {
    if (socket && !loadingSocket) {
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
        let shouldAdd = false;

        setUserData((prevUserData) => {
          let updatedSlimes = prevUserData.slimes
            ? [...prevUserData.slimes]
            : [];
          const alreadyExists = updatedSlimes.some((s) => s.id === slime.id);

          if (!alreadyExists) {
            updatedSlimes.push(slime);
            shouldAdd = true;
          }
          return {
            ...prevUserData,
            slimes: updatedSlimes,
          };
        });

        preloadImageCached(slime.imageUri);

        if (shouldAdd) {
          setTimeout(() => {
            addFloatingUpdate({
              icon: GenericSlime,
              text: `Slime #${slime.id}`,
              amount: 1,
            });
          }, 0);
        }
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

        // Calculate expGain using ref (always current)
        let expGain = 0;
        if (data.farmingLevelsGained > 0) {
          expGain =
            userData.expToNextFarmingLevel -
            prevFarmingExpRef.current +
            data.farmingExp;
        } else {
          expGain = data.farmingExp - prevFarmingExpRef.current;
        }

        setUserData((prevUserData) => {
          return {
            ...prevUserData,
            farmingExp: data.farmingExp,
            farmingLevel: data.farmingLevel,
            expToNextFarmingLevel: data.expToNextFarmingLevel,
          };
        });

        // Direct floating update (no setTimeout needed)
        if (expGain > 0) {
          addFloatingUpdate({
            icon: FarmingIcon,
            text: "Farming EXP",
            amount: expGain,
          });
        }

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

        // Calculate expGain using ref (always current)
        let expGain = 0;
        if (data.craftingLevelsGained > 0) {
          expGain =
            userData.expToNextCraftingLevel -
            prevCraftingExpRef.current +
            data.craftingExp;
        } else {
          expGain = data.craftingExp - prevCraftingExpRef.current;
        }

        setUserData((prevUserData) => {
          return {
            ...prevUserData,
            craftingExp: data.craftingExp,
            craftingLevel: data.craftingLevel,
            expToNextCraftingLevel: data.expToNextCraftingLevel,
          };
        });

        // Direct floating update (no setTimeout needed)
        if (expGain > 0) {
          addFloatingUpdate({
            icon: CraftingIcon,
            text: "Crafting EXP",
            amount: expGain,
          });
        }

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

          let hpExpDelta = 0;
          let expDelta = 0;

          setUserData((prev) => {
            if (!prev) return prev;

            // Calculate HP EXP gain
            if (data.hpLevelUp) {
              // When HP leveling up, calculate total exp gained:
              // = exp needed to complete previous HP level + current exp in new HP level
              hpExpDelta = prev.expToNextHpLevel - prev.expHp + data.hpExp;
            } else {
              // Normal case: just the difference
              hpExpDelta = data.hpExp - prev.expHp;
            }

            // Calculate regular EXP gain
            if (data.levelUp) {
              // When leveling up, calculate total exp gained:
              // = exp needed to complete previous level + current exp in new level
              expDelta = prev.expToNextLevel - prev.exp + data.exp;
            } else {
              // Normal case: just the difference
              expDelta = data.exp - prev.exp;
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

          if (hpExpDelta > 0 && !data.hpLevelUp) {
            setTimeout(() => {
              addFloatingUpdate({
                icon: HPIcon,
                text: "HP EXP",
                amount: hpExpDelta,
              });
            }, 0);
          }

          if (expDelta > 0 && !data.levelUp) {
            setTimeout(() => {
              addFloatingUpdate({
                icon: GoldMedalIcon,
                text: "EXP",
                amount: expDelta,
              });
            }, 0);
          }

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
            <ReferralSuccessNotification
              header={"Referral Link Applied"}
              msg={
                "Referral activated! You’ll now earn 10% more DITTO in combat."
              }
            />
          ));
        }
      );

      socket.on(BETA_TESTER_LOGIN_EVENT, () => {
        console.log(`BETA_TESTER_LOGIN_EVENT received`);
        addNotification(() => <BetaTestersLoginNotif />);
      });

      socket.on("error", (msg: string) => {
        addNotification(() => <ErrorNotification msg={msg} />);
        if (msg.toLowerCase().includes("sticker")) {
          setCanGenerateStickers(true);
        }
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
        socket.off("user-update");
        socket.off(COMBAT_EXP_UPDATE_EVENT);
        socket.off("pump-stats-complete");
        socket.off(FIRST_LOGIN_EVENT);
        socket.off("error");
      };
    }
  }, [socket, loadingSocket]);

  useEffect(() => {
    if (!socket) return;

    const handleStarsInvoiceCreated = (data: {
      userId: string;
      invoiceUrl: any;
      shopItemId: number;
      shopItemName: string;
      quantity: number;
      totalStars: number;
    }) => {
      console.log("Stars invoice created:", data); // Log the whole object properly

      // Open Telegram payment interface
      if (WebApp) {
        WebApp.openInvoice(data.invoiceUrl, (status: string) => {
          if (status === "paid") {
            console.log("Payment successful!");
            addNotification(() => (
              <PurchaseSuccessNotification
                msg={`You have purchased ${data.shopItemName} x${data.quantity} for ${data.totalStars} Stars!`}
              />
            ));
          } else if (status === "cancelled") {
            console.log("Payment cancelled");
            addNotification(() => (
              <ErrorNotification msg={"Payment cancelled"} />
            ));
          } else if (status === "failed") {
            console.log("Payment failed");
            addNotification(() => <ErrorNotification msg={"Payment failed"} />);
          }
        });
      } else {
        // Fallback: open invoice URL directly
        window.open(data.invoiceUrl, "_blank");
      }
    };

    socket.on(STARS_INVOICE_CREATED_EVENT, handleStarsInvoiceCreated);

    return () => {
      socket.off(STARS_INVOICE_CREATED_EVENT, handleStarsInvoiceCreated);
    };
  }, [socket]);

  const [canGenerateStickers, setCanGenerateStickers] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const handleStickerGenerationSuccess = () => {
      console.log("ADD_STICKERS_FOR_SLIME_SUCCESS received");
      addNotification(() => (
        <PurchaseSuccessNotification
          msg={`Stickers generated! Check the Ditto Quest Bot for the download link.`}
        />
      ));
      setCanGenerateStickers(true);
    };

    socket.on(ADD_STICKERS_FOR_SLIME_SUCCESS, handleStickerGenerationSuccess);

    return () => {
      socket.off(
        ADD_STICKERS_FOR_SLIME_SUCCESS,
        handleStickerGenerationSuccess
      );
    };
  }, [socket]);

  useEffect(() => {
    console.log(
      `User context check: userLoaded=${userLoaded}, dittoBalanceLoaded=${dittoBalanceLoaded}, userEfficiencyStatsLoaded=${userEfficiencyStatsLoaded}, userContextLoaded=${userContextLoaded}`
    );

    if (
      userLoaded &&
      dittoBalanceLoaded &&
      userEfficiencyStatsLoaded &&
      !userContextLoaded
    ) {
      setUserContextLoaded(true);
      console.log(`✅ User context now loaded`);

      LoginManager.getInstance().setUserDataLoaded(userData);
    }
  }, [
    userLoaded,
    dittoBalanceLoaded,
    userEfficiencyStatsLoaded,
    userContextLoaded,
  ]);

  return (
    <UserContext.Provider
      value={{
        userData,
        userEfficiencyStats,
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
        removeSlimeById,
        canGenerateStickers,
        setCanGenerateStickers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
