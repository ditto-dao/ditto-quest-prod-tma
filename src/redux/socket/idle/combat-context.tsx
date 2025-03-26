import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Combat,
  defaultCombat,
  defaultMonster,
  Domain,
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
  START_COMBAT_DOMAIN_EVENT,
  STOP_COMBAT_EVENT,
} from "../../../utils/events";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface CombatHpChangeEventPayload {
  target: "user" | "monster";
  hpAmount: number;
}

// Context
interface CombatContext {
  isBattling: boolean;
  userCombat: Combat;
  monster: FullMonster | null;
  combatArea: Domain | null;
  enterDomain: (domain: Domain) => void;
  runAway: () => void;
  userHpChange: { timestamp: number, hpChange: number } | undefined;
  monsterHpChange: { timestamp: number, hpChange: number } | undefined;
}

const CombatContext = createContext<CombatContext>({
  isBattling: false,
  userCombat: defaultCombat,
  monster: defaultMonster,
  combatArea: null,
  enterDomain: () => {},
  runAway: () => {},
  userHpChange: undefined,
  monsterHpChange: undefined
});

export const useCombatSocket = () => useContext(CombatContext);

export const CombatSocketProvider: React.FC<SocketProviderProps> = ({
  children,
}) => {
  const { userData, incrementUserHp } = useUserSocket();
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();
  const telegramId = useSelector((state: RootState) => state.telegramId.id);

  const [isBattling, setIsBattling] = useState(false);
  const [userCombat, setUserCombat] = useState(defaultCombat);
  const [monster, setMonster] = useState<FullMonster | null>(null);
  const [combatArea, setCombatArea] = useState<Domain | null>(null);

  const [userHpChange, setUserHpChange] = useState<{ timestamp: number, hpChange: number }>();
  const [monsterHpChange, setMonsterHpChange] = useState<{ timestamp: number, hpChange: number }>();

  const enterDomain = (domain: Domain) => {
    setIsBattling(true);
    setCombatArea(domain);
    if (socket && canEmitEvent() && telegramId) {
      socket.emit(START_COMBAT_DOMAIN_EVENT, domain.id);
      setLastEventEmittedTimestamp(Date.now());
    }
    console.log(`Entering domain ${domain.id}, ${domain.name}`);
  };

  const runAway = () => {
    if (socket && canEmitEvent() && telegramId) {
      socket.emit(STOP_COMBAT_EVENT, telegramId);
      setLastEventEmittedTimestamp(Date.now());
      setIsBattling(false);
      setMonster(null);
      setCombatArea(null);
    }
    console.log(`Emitting stop combat event`);
  };

  useEffect(() => {
    if (userData.combat) setUserCombat(userData.combat);
  }, [userData.combat]);

  useEffect(() => {
    if (socket && !loadingSocket) {
      socket.on(COMBAT_STARTED_EVENT, (payload: { monster: FullMonster }) => {
        console.log(
          `Received COMBAT_STARTED_EVENT: ${JSON.stringify(payload, null, 2)}`
        );
        setIsBattling(true);
        setMonster(payload.monster);
      });

      socket.on(COMBAT_STOPPED_EVENT, () => {
        console.log(`Received COMBAT_STOPPED_EVENT`);
        setIsBattling(false);
        setMonster(null);
        setCombatArea(null);
      });

      socket.on(COMBAT_HP_CHANGE_EVENT, (data: CombatHpChangeEventPayload) => {
        console.log(
          `Received COMBAT_HP_CHANGE_EVENT: ${JSON.stringify(data, null, 2)}`
        );
        if (data.target === "user") {
          setUserHpChange({ timestamp: Date.now(), hpChange: data.hpAmount });
          incrementUserHp(data.hpAmount);
        } else {
          setMonsterHpChange({ timestamp: Date.now(), hpChange: data.hpAmount });

          setMonster((prevMonsterData) => {
            if (!prevMonsterData) {
              console.error(`Unable to change monster hp. Monster is null`);
              return null;
            }

            if (!prevMonsterData.combat) {
              throw new Error("No combat object found for monster");
            }
            const { hp, maxHp } = prevMonsterData.combat;
            const newHp = Math.max(0, Math.min(maxHp, hp + data.hpAmount));

            return {
              ...prevMonsterData,
              combat: {
                ...prevMonsterData.combat,
                hp: newHp,
              },
            };
          });
        }
      });

      socket.on(COMBAT_USER_DIED_EVENT, () => {
        console.log(`Received COMBAT_USER_DIED_EVENT`);
        setIsBattling(false);
        setMonster(null);
        setCombatArea(null);
        incrementUserHp(Infinity);
        alert(`You have died.`); // change to notification
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
        enterDomain,
        runAway,
        userHpChange,
        monsterHpChange
      }}
    >
      {children}
    </CombatContext.Provider>
  );
};
