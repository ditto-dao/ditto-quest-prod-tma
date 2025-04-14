import { useEffect, useRef, useState } from "react";
import { useCombatSocket } from "../../../redux/socket/idle/combat-context";
import "./combat-console.css";
import BattleIcon from "../../../assets/images/combat/battle-icon.png";
import {
  calculateCombatPower,
  formatDecimalWithCommas,
  formatDecimalWithSuffix,
  formatNumberWithCommas,
  preloadImage,
} from "../../../utils/helpers";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import GoldMedalIcon from "../../../assets/images/combat/gold-medal.png";
import HPLevelIcon from "../../../assets/images/combat/hp-lvl.png";
import MeleeCombatLabel from "../../../assets/images/combat/melee-combat-label.png";
import RangedCombatLabel from "../../../assets/images/combat/ranged-combat-label.png";
import MagicombatLabel from "../../../assets/images/combat/magic-combat-label.png";
import { defaultCombat } from "../../../utils/types";
import Decimal from "decimal.js";
import { AnimatePresence, motion } from "framer-motion";

function BattleBoxLoader() {
  return (
    <div className="loader">
      <div className="loader-left shimmer" />
      <div className="loader-right">
        <div className="loader-bar shimmer" />
        <div className="loader-bar short shimmer" />
        <div className="loader-hp shimmer" />
      </div>
    </div>
  );
}

function CombatConsole() {
  const { userData } = useUserSocket();
  const {
    userCombat,
    monster,
    runAway,
    combatArea,
    userHpChange,
    monsterHpChange,
  } = useCombatSocket();
  const userHpChangeRef = useRef<HTMLDivElement>(null);
  const monsterHpChangeRef = useRef<HTMLDivElement>(null);

  const [iconImagesLoaded, setIconImagesLoaded] = useState(false);
  const [userSlimeImageLoaded, setUserSlimeImageLoaded] = useState(false);
  const [monsterImagesLoaded, setMonsterImagesLoaded] = useState(false);

  const cp = calculateCombatPower(userData.combat || defaultCombat);
  const monsterCp = new Decimal(monster?.combat.cp || 0);

  function spawnFloatingText(
    ref: React.RefObject<HTMLElement>,
    hpChange: number,
    crit: boolean
  ) {
    const isMiss = hpChange === 0;
    const sign = hpChange > 0 ? "+" : "";
    const text = isMiss ? "Miss!" : `${sign}${hpChange}${crit ? "!" : ""}`;
    const color = isMiss
      ? "var(--rarity-d)"
      : hpChange > 0
      ? "var(--seafoam-green)"
      : "var(--deep-warm-red)";

    const textElement = document.createElement("div");
    textElement.textContent = text;
    textElement.classList.add("floating-text");
    if (crit) textElement.classList.add("crit"); // ✨ Add crit styles
    textElement.style.color = color;
    textElement.style.setProperty("--target-x", "10px");
    textElement.style.setProperty("--target-y", "-45px");

    if (ref.current) {
      ref.current.appendChild(textElement);
      setTimeout(() => textElement.remove(), 1500);
    }
  }

  const fadeVariant = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 },
  };

  useEffect(() => {
    const iconsToPreload = [
      BattleIcon,
      GoldMedalIcon,
      HPLevelIcon,
      MeleeCombatLabel,
      RangedCombatLabel,
      MagicombatLabel,
    ];

    Promise.all(iconsToPreload.map(preloadImage)).then(() =>
      setIconImagesLoaded(true)
    );
  }, []);

  useEffect(() => {
    if (userData?.equippedSlime?.imageUri) {
      preloadImage(userData.equippedSlime.imageUri).then(() =>
        setUserSlimeImageLoaded(true)
      );
    } else {
      setUserSlimeImageLoaded(false);
    }
  }, [userData?.equippedSlime?.imageUri]);

  useEffect(() => {
    const promises: Promise<void>[] = [];

    if (monster?.imgsrc) {
      promises.push(preloadImage(monster.imgsrc));
    }

    if (combatArea?.imgsrc) {
      promises.push(preloadImage(combatArea.imgsrc));
    }

    if (promises.length > 0) {
      Promise.all(promises).then(() => setMonsterImagesLoaded(true));
    } else {
      setMonsterImagesLoaded(false);
    }
  }, [monster?.imgsrc, combatArea?.imgsrc]);

  useEffect(() => {
    if (monsterHpChange) {
      if (
        monsterHpChange.hpChange > 0 &&
        monster &&
        monster.combat &&
        monster.combat.hp >= monster.combat.maxHp
      )
        return;
      spawnFloatingText(
        monsterHpChangeRef,
        monsterHpChange.hpChange,
        monsterHpChange.crit
      );
    }
  }, [monsterHpChange]);

  useEffect(() => {
    if (userHpChange) {
      if (userHpChange.hpChange > 0 && userCombat.hp >= userCombat.maxHp)
        return;

      spawnFloatingText(
        userHpChangeRef,
        userHpChange.hpChange,
        userHpChange.crit
      );
    }
  }, [userHpChange]);

  const handleRun = async () => {
    if (userData.combat && userData.combat?.hp <= 0) return;
    await runAway();
  };

  const getHpBarColor = (hpPercent: number) => {
    if (hpPercent <= 35) return "var(--deep-warm-red)"; // Red
    if (hpPercent <= 60) return "var(--burnt-orange)"; // Orange
    return "var(--sage-green)"; // Green
  };

  return (
    <div className="combat-console-container">
      <div className="battle-box-outer">
        <div className="battle-box-label">
          {combatArea?.name || monster?.name || "Battle"}
        </div>
        <div className="battle-box">
          <div className="battle-box-inner">
            <AnimatePresence mode="wait">
              {!monster || !iconImagesLoaded || !monsterImagesLoaded ? (
                <motion.div
                  key="monster-loader"
                  {...fadeVariant}
                  className="fade-content"
                >
                  <BattleBoxLoader />
                </motion.div>
              ) : (
                <motion.div
                  key="monster-ui"
                  {...fadeVariant}
                  className="fade-content"
                >
                  <div className="combat-type-icon">
                    <img
                      className="combat-type-img"
                      src={
                        monster.combat.attackType === "Melee"
                          ? MeleeCombatLabel
                          : monster.combat.attackType === "Ranged"
                          ? RangedCombatLabel
                          : MagicombatLabel
                      }
                      alt={`${monster.combat.attackType} icon`}
                    />
                  </div>
                  <div className="battle-box-left">
                    <div className="monster-img-wrapper">
                      <img
                        className="monster-bg-img"
                        src={combatArea?.imgsrc}
                        alt="Area BG"
                      />
                      <img
                        className="monster-img"
                        src={monster.imgsrc}
                        alt={monster.name}
                      />
                    </div>
                  </div>
                  <div className="battle-box-right">
                    <div className="monster-header">
                      <div className="monster-name">{monster.name}</div>
                    </div>
                    <div className="monster-stats">
                      <div className="monster-level">LVL {monster.level}</div>
                      <div className="monster-cp">
                        CP{" "}
                        {monsterCp.lt(1_000_000)
                          ? formatDecimalWithCommas(monsterCp)
                          : formatDecimalWithSuffix(monsterCp)}
                      </div>
                    </div>
                    <div className="hp-bar-monster" ref={monsterHpChangeRef}>
                      <div
                        className="hp-progress-bar"
                        style={{
                          width: `${Math.ceil(
                            (monster.combat.hp / monster.combat.maxHp) * 100
                          )}%`,
                          backgroundColor: getHpBarColor(
                            Math.ceil(
                              (monster.combat.hp / monster.combat.maxHp) * 100
                            )
                          ),
                        }}
                      />
                    </div>
                    <div className="hp-text">
                      {formatNumberWithCommas(monster.combat.hp)} /{" "}
                      {formatNumberWithCommas(monster.combat.maxHp)} HP
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="battle-icon-container">
            <img className="battle-icon-img" src={BattleIcon} />
          </div>

          <div className="battle-box-inner">
            <AnimatePresence mode="wait">
              {!userData || !iconImagesLoaded || !userSlimeImageLoaded ? (
                <motion.div
                  key="user-loader"
                  {...fadeVariant}
                  className="fade-content"
                >
                  <BattleBoxLoader />
                </motion.div>
              ) : (
                <motion.div
                  key="user-ui"
                  {...fadeVariant}
                  className="fade-content"
                >
                  <div className="combat-type-icon">
                    <img
                      className="combat-type-img"
                      src={
                        userCombat.attackType === "Melee"
                          ? MeleeCombatLabel
                          : userCombat.attackType === "Ranged"
                          ? RangedCombatLabel
                          : MagicombatLabel
                      }
                      alt={`${userCombat.attackType} icon`}
                    />
                  </div>
                  <div className="battle-box-left">
                    <img
                      className="monster-img"
                      src={userData.equippedSlime?.imageUri}
                    />
                  </div>
                  <div className="battle-box-right">
                    <div className="monster-header">
                      <div className="monster-name">{userData.username}</div>
                    </div>
                    <div className="monster-stats">
                      <div className="monster-level">LVL {userData.level}</div>
                      <div className="monster-cp">
                        CP{" "}
                        {cp.lt(1_000_000)
                          ? formatDecimalWithCommas(cp)
                          : formatDecimalWithSuffix(cp)}
                      </div>
                    </div>
                    <div className="hp-bar-user" ref={userHpChangeRef}>
                      <div
                        className="hp-progress-bar"
                        style={{
                          width: `${Math.ceil(
                            (userData.combat!.hp / userData.combat!.maxHp) * 100
                          )}%`,
                          backgroundColor: getHpBarColor(
                            Math.ceil(
                              (userData.combat!.hp / userData.combat!.maxHp) *
                                100
                            )
                          ),
                        }}
                      />
                    </div>
                    <div className="hp-text">
                      {formatNumberWithCommas(userCombat.hp)} /{" "}
                      {formatNumberWithCommas(userCombat.maxHp)} HP
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="combat-console-exp-progress">
            <div className="combat-console-exp">
              <img src={GoldMedalIcon} alt="exp icon" className="exp-icon" />
              <div className="exp-label">EXP</div>
              <div className="exp-bar">
                <div
                  className="exp-progress-bar"
                  style={{
                    width: `${(userData.exp / userData.expToNextLevel) * 100}%`,
                    backgroundColor: `var(--rarity-s)`,
                  }}
                />
              </div>
            </div>
            <div className="combat-console-exp">
              <img src={HPLevelIcon} alt="hp lvl icon" className="exp-icon" />
              <div className="exp-label">EXP</div>
              <div className="exp-bar">
                <div
                  className="exp-progress-bar"
                  style={{
                    width: `${
                      (userData.expHp / userData.expToNextHpLevel) * 100
                    }%`,
                    backgroundColor: `var(--rarity-s)`,
                  }}
                />
              </div>
            </div>
          </div>
          <button
            className="run-button"
            disabled={!monster}
            onClick={async () => {
              await handleRun();
            }}
          >
            Run Away
          </button>
        </div>
      </div>
    </div>
  );
}

export default CombatConsole;
