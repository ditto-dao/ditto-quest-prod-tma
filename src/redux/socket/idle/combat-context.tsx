import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Combat,
  defaultCombat,
  defaultMonster,
  Domain,
  Dungeon,
  FullMonster,
  SocketProviderProps,
} from "../../../utils/types";
import { useUserSocket } from "../user/user-context";
import { useSocket } from "../socket-context";
import { useLoginSocket } from "../login/login-context";
import {
  COMBAT_HP_CHANGE_EVENT,
  COMBAT_STARTED_EVENT,
  COMBAT_STOPPED_EVENT,
  COMBAT_USER_DIED_EVENT,
  LEDGER_UPDATE_BALANCE_EVENT,
  START_COMBAT_DOMAIN_EVENT,
  START_COMBAT_DUNGEON_EVENT,
  STOP_COMBAT_EVENT,
} from "../../../utils/events";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Domains from "../../../assets/json/domains.json";
import DungeonsJson from "../../../assets/json/dungeons.json";
import { useNotification } from "../../../components/notifications/notification-context";
import DeathNotification from "../../../components/notifications/notification-content/user-death/death-notification";
import { delay, getDeductionPayloadToDevFunds } from "../../../utils/helpers";
import { useCurrentActivityContext } from "./current-activity-context";
import { ENTER_DOMAIN_TRX_NOTE, ENTER_DUNGEON_TRX_NOTE } from "../../../utils/trx-config";

interface CombatHpChangeEventPayload {
  target: "user" | "monster";
  hp: number;
  maxHp: number;
  dmg: number;
  crit: boolean;
}

// Context
interface CombatContext {
  isBattling: boolean;
  userCombat: Combat;
  monster: FullMonster | null;
  combatArea: Domain | Dungeon | null;
  dungeonFloor: number | null;
  dungeonMonsterId: number | null;
  enterDomainGp: (domain: Domain) => void;
  enterDomainDitto: (domain: Domain) => void;
  enterDungeonGp: (dungeon: Dungeon) => void;
  enterDungeonDitto: (dungeon: Dungeon) => void;
  runAway: () => Promise<void>;
  userHpChange:
    | { timestamp: number; hpChange: number; crit: boolean }
    | undefined;
  monsterHpChange:
    | { timestamp: number; hpChange: number; crit: boolean }
    | undefined;
}

const CombatContext = createContext<CombatContext>({
  isBattling: false,
  userCombat: defaultCombat,
  monster: defaultMonster,
  combatArea: null,
  dungeonFloor: null,
  dungeonMonsterId: null,
  enterDomainGp: () => {},
  enterDomainDitto: () => {},
  enterDungeonGp: () => {},
  enterDungeonDitto: () => {},
  runAway: async () => {},
  userHpChange: undefined,
  monsterHpChange: undefined,
});

export const useCombatSocket = () => useContext(CombatContext);

export const CombatSocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const { userData, dittoBalance, incrementUserHp, setUserHp } =
    useUserSocket();
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { addNotification } = useNotification();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();
  const { setCurrentActivity } = useCurrentActivityContext();

  const telegramId = useSelector((state: RootState) => state.telegramId.id);

  const [isBattling, setIsBattling] = useState(false);
  const [userCombat, setUserCombat] = useState(defaultCombat);
  const [monster, setMonster] = useState<FullMonster | null>(null);
  const [combatArea, setCombatArea] = useState<Domain | Dungeon | null>(null);
  const [dungeonFloor, setDungeonFloor] = useState<number | null>(null);
  const [dungeonMonsterId, setDungeonMonsterId] = useState<number | null>(null);

  const [userHpChange, setUserHpChange] = useState<{
    timestamp: number;
    hpChange: number;
    crit: boolean;
  }>();
  const [monsterHpChange, setMonsterHpChange] = useState<{
    timestamp: number;
    hpChange: number;
    crit: boolean;
  }>();

  const enterDomainGp = (domain: Domain) => {
    if (isBattling) {
      console.warn(`Already in battle, ignoring duplicate start battle`);
      return;
    }
    setIsBattling(true);
    setCombatArea(domain);
    if (socket && canEmitEvent() && telegramId) {
      socket.emit(START_COMBAT_DOMAIN_EVENT, domain.id);
      setLastEventEmittedTimestamp(Date.now());
    }
    console.log(`Entering domain ${domain.id}, ${domain.name}`);
  };

  const enterDomainDitto = (domain: Domain) => {
    if (socket && canEmitEvent() && telegramId) {
      if (isBattling) {
        console.warn(`Already in battle, ignoring duplicate start battle`);
        return;
      }
      setIsBattling(true);
      setCombatArea(domain);

      socket.emit(
        LEDGER_UPDATE_BALANCE_EVENT,
        getDeductionPayloadToDevFunds(
          telegramId.toString(),
          dittoBalance,
          BigInt(domain.entryPriceDittoWei || "0"),
          ENTER_DOMAIN_TRX_NOTE + ` ${domain.id}`
        )
      );
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  const enterDungeonGp = (dungeon: Dungeon) => {
    if (isBattling) {
      console.warn(`Already in battle, ignoring duplicate start battle`);
      return;
    }
    setIsBattling(true);
    setCombatArea(dungeon);
    if (socket && canEmitEvent() && telegramId) {
      socket.emit(START_COMBAT_DUNGEON_EVENT, dungeon.id);
      setLastEventEmittedTimestamp(Date.now());
    }
    console.log(`Entering dungeon ${dungeon.id}, ${dungeon.name}`);
  };

  const enterDungeonDitto = (dungeon: Dungeon) => {
    if (socket && canEmitEvent() && telegramId) {
      if (isBattling) {
        console.warn(`Already in battle, ignoring duplicate start battle`);
        return;
      }
      setIsBattling(true);
      setCombatArea(dungeon);

      socket.emit(
        LEDGER_UPDATE_BALANCE_EVENT,
        getDeductionPayloadToDevFunds(
          telegramId.toString(),
          dittoBalance,
          BigInt(dungeon.entryPriceDittoWei || "0"),
          ENTER_DUNGEON_TRX_NOTE + ` ${dungeon.id}`
        )
      );
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  const runAway = async () => {
    if (socket && canEmitEvent() && telegramId) {
      socket.emit(STOP_COMBAT_EVENT, telegramId);
      setLastEventEmittedTimestamp(Date.now());
      setIsBattling(false);
      setCurrentActivity(null);
      await delay(300);
      setMonster(null);
      setCombatArea(null);
      setDungeonFloor(null);
      setDungeonMonsterId(null);
    }
    console.log(`Emitting stop combat event`);
  };

  useEffect(() => {
    if (userData.combat) setUserCombat(userData.combat);
  }, [userData.combat]);

  useEffect(() => {
    if (socket && !loadingSocket && accessGranted) {
      socket.on(
        COMBAT_STARTED_EVENT,
        (payload: {
          monster: FullMonster;
          combatAreaType: "Dungeon" | "Domain";
          combatAreaId: number;
          dungeonFloor: number;
          dungeonMonsterId: number;
        }) => {
          console.log(
            `Received COMBAT_STARTED_EVENT monster: ${JSON.stringify(
              {
                monsterDefined: !!payload.monster,
                combatAreaType: payload.combatAreaType,
                combatAreaId: payload.combatAreaId,
                dungeonFloor: payload.dungeonFloor,
                dungeonMonsterId: payload.dungeonMonsterId,
              },
              null,
              2
            )}`
          );

          if (payload.monster) {
            setIsBattling(true);
            setMonster(payload.monster);
            setCurrentActivity({
              type: "combat",
              name: payload.monster.name,
              imgsrc1: payload.monster.imgsrc,
            });
          } else {
            setCurrentActivity((prev) => {
              if (prev?.type === "combat") {
                console.log("stopping combat current activity");
                return null;
              }
              console.log("NOT stopping combat current activity");
              return prev;
            });
            setMonster(null);
          }

          if (payload.combatAreaType === "Domain") {
            const domain = (Domains as unknown as Domain[]).find(
              (d) => d.id === payload.combatAreaId
            );
            if (domain) {
              setCombatArea(domain);
            } else {
              console.warn(
                `Domain with ID ${payload.combatAreaId} not found in Domains JSON`
              );
            }
          }

          if (payload.combatAreaType === "Dungeon") {
            const dungeon = (DungeonsJson as unknown as Dungeon[]).find(
              (d) => d.id === payload.combatAreaId
            );
            if (dungeon) {
              setCombatArea(dungeon);
            } else {
              console.warn(
                `Dungeon with ID ${payload.combatAreaId} not found in Dungeons JSON`
              );
            }
          }

          if (
            payload.dungeonFloor !== null &&
            payload.dungeonFloor !== undefined &&
            payload.dungeonMonsterId !== null &&
            payload.dungeonMonsterId !== undefined
          ) {
            console.log(`Setting dungeon floor and id.`);
            setDungeonFloor(payload.dungeonFloor);
            setDungeonMonsterId(payload.dungeonMonsterId + 1);
          }
        }
      );

      socket.on(COMBAT_STOPPED_EVENT, () => {
        console.log(`Received COMBAT_STOPPED_EVENT`);
        setIsBattling(false);
        setMonster(null);
        setDungeonFloor(null);
        setDungeonMonsterId(null);
        setCombatArea(null);
        setUserHpChange(undefined);
        setCurrentActivity((prev) => {
          if (prev?.type === "combat") {
            console.log("stopping combat current activity");
            return null;
          }
          console.log("NOT stopping combat current activity");
          return prev;
        });
      });

      socket.on(COMBAT_HP_CHANGE_EVENT, (data: CombatHpChangeEventPayload) => {
        console.log(
          `Received COMBAT_HP_CHANGE_EVENT: ${JSON.stringify(data, null, 2)}`
        );
        if (data.target === "user") {
          setUserHpChange({
            timestamp: Date.now(),
            hpChange: data.dmg,
            crit: data.crit,
          });
          setUserHp(data.hp, data.maxHp);
        } else {
          setMonsterHpChange({
            timestamp: Date.now(),
            hpChange: data.dmg,
            crit: data.crit,
          });

          setMonster((prevMonsterData) => {
            if (!prevMonsterData) {
              console.trace(`Unable to change monster hp. Monster is null`);
              return null;
            }

            if (!prevMonsterData.combat) {
              throw new Error("No combat object found for monster");
            }
            return {
              ...prevMonsterData,
              combat: {
                ...prevMonsterData.combat,
                hp: data.hp,
                maxHp: data.maxHp,
              },
            };
          });
        }
      });

      socket.on(COMBAT_USER_DIED_EVENT, async () => {
        console.log(`Received COMBAT_USER_DIED_EVENT`);
        await delay(800);

        addNotification(() => <DeathNotification />);

        setIsBattling(false);
        setMonster(null);
        setDungeonFloor(null);
        setDungeonMonsterId(null);
        setCombatArea(null);
        incrementUserHp(Infinity);
        setUserHpChange(undefined);
      });

      return () => {
        socket.off(COMBAT_STARTED_EVENT);
        socket.off(COMBAT_STOPPED_EVENT);
        socket.off(COMBAT_HP_CHANGE_EVENT);
        socket.off(COMBAT_USER_DIED_EVENT);
      };
    }
  }, [socket, loadingSocket, accessGranted]);

  return (
    <CombatContext.Provider
      value={{
        isBattling,
        userCombat,
        monster,
        combatArea,
        dungeonFloor,
        dungeonMonsterId,
        enterDomainGp,
        enterDomainDitto,
        enterDungeonGp,
        enterDungeonDitto,
        runAway,
        userHpChange,
        monsterHpChange,
      }}
    >
      {children}
    </CombatContext.Provider>
  );
};
