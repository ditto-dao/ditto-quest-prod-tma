import { useEffect, useRef, useState } from "react";
import { useCombatSocket } from "../../../redux/socket/idle/combat-context";
import "./combat-console.css";
import BattleIcon from "../../../assets/images/combat/battle-icon.png";
import { formatNumberWithCommas } from "../../../utils/helpers";
import { useUserSocket } from "../../../redux/socket/user/user-context";

function BattleBoxLoader() {
  return (
    <div className="battle-box-inner loader">
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
  const [monsterHpProgress, setMonsterHpProgress] = useState(100);
  const [userHpProgress, setUserHpProgress] = useState(100);

  const userHpChangeRef = useRef<HTMLDivElement>(null);
  const monsterHpChangeRef = useRef<HTMLDivElement>(null);

  function spawnFloatingText(
    ref: React.RefObject<HTMLElement>,
    hpChange: number
  ) {
    const isMiss = hpChange === 0;
    const sign = hpChange > 0 ? "+" : "";
    const text = isMiss ? "Miss!" : `${sign}${hpChange}`;
    const color = isMiss
      ? "var(--rarity-d)"
      : hpChange > 0
      ? "var(--seafoam-green)"
      : "var(--deep-warm-red)";

    const textElement = document.createElement("div");
    textElement.textContent = text;
    textElement.classList.add("floating-text");
    textElement.style.color = color;
    textElement.style.setProperty("--target-x", "10px");
    textElement.style.setProperty("--target-y", "-45px");

    if (ref.current) {
      ref.current.appendChild(textElement);
      setTimeout(() => textElement.remove(), 1500);
    }
  }

  useEffect(() => {
    if (monsterHpChange) {
      if (
        monsterHpChange.hpChange > 0 &&
        monster &&
        monster.combat &&
        monster.combat.hp >= monster.combat.maxHp
      )
        return;
      spawnFloatingText(monsterHpChangeRef, monsterHpChange.hpChange);
    }
  }, [monsterHpChange]);

  useEffect(() => {
    if (userHpChange) {
      if (userHpChange.hpChange > 0 && userCombat.hp >= userCombat.maxHp)
        return;

      spawnFloatingText(userHpChangeRef, userHpChange.hpChange);
    }
  }, [userHpChange]);

  const handleRun = () => {
    runAway();
  };

  useEffect(() => {
    if (monster && monster.combat.maxHp > 0) {
      console.log(`monster hp: ${monster.combat.hp} / ${monster.combat.maxHp}`);
      setMonsterHpProgress((monster.combat.hp / monster.combat.maxHp) * 100);
    }
  }, [monster?.combat.hp]);

  useEffect(() => {
    if (userData && userData.combat && userData.maxHp > 0) {
      console.log(`user hp: ${userData.combat.hp} / ${userData.combat.maxHp}`);
      setUserHpProgress((userData.combat.hp / userData.combat.maxHp) * 100);
    }
  }, [userData.combat?.hp]);

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
          {!monster ? (
            <BattleBoxLoader />
          ) : (
            <div className="battle-box-inner">
              <div className="battle-box-left">
                <img className="monster-img" src={monster.imgsrc} />
              </div>
              <div className="battle-box-right">
                <div className="monster-header">
                  <div className="monster-name">{monster.name}</div>
                  <div className="monster-level">LVL {monster.level}</div>
                </div>
                <div className="hp-bar-monster" ref={monsterHpChangeRef}>
                  <div
                    className="hp-progress-bar"
                    style={{
                      width: `${monsterHpProgress}%`,
                      backgroundColor: getHpBarColor(monsterHpProgress),
                    }}
                  />
                </div>
                <div className="hp-text">
                  {formatNumberWithCommas(monster.combat.hp)} /{" "}
                  {formatNumberWithCommas(monster.combat.maxHp)} HP
                </div>
              </div>
            </div>
          )}
          <div className="battle-icon-container">
            <img className="battle-icon-img" src={BattleIcon} />
          </div>
          {!userData ? (
            <BattleBoxLoader />
          ) : (
            <div className="battle-box-inner">
              <div className="battle-box-left">
                <img
                  className="monster-img"
                  src={userData.equippedSlime?.imageUri}
                />
              </div>
              <div className="battle-box-right">
                <div className="monster-header">
                  <div className="monster-name">{userData.username}</div>
                  <div className="monster-level">LVL {userData.level}</div>
                </div>{" "}
                <div className="hp-bar-user" ref={userHpChangeRef}>
                  <div
                    className="hp-progress-bar"
                    style={{
                      width: `${userHpProgress}%`,
                      backgroundColor: getHpBarColor(userHpProgress),
                    }}
                  />
                </div>
                <div className="hp-text">
                  {formatNumberWithCommas(userCombat.hp)} /{" "}
                  {formatNumberWithCommas(userCombat.maxHp)} HP
                </div>
              </div>
            </div>
          )}
          <button className="run-button" onClick={handleRun}>
            Run Away
          </button>
        </div>
      </div>
    </div>
  );
}

export default CombatConsole;
