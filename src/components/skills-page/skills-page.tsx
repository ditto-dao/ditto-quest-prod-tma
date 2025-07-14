import { useUserSocket } from "../../redux/socket/user/user-context";
import CombatStat from "./combat-stat/combat-stat";
import EfficiencyStat from "./efficiency-stat/efficiency-stat";
import Skill from "./skill/skill";
import "./skills-page.css";
import MaxHpIcon from "../../assets/images/combat/max-hp.png";
import AtkSpdIcon from "../../assets/images/combat/atk-spd.png";
import AccIcon from "../../assets/images/combat/acc.png";
import EvaIcon from "../../assets/images/combat/eva.png";
import MaxMeleeDmgIcon from "../../assets/images/combat/max-melee-dmg.png";
import MaxRangedDmgIcon from "../../assets/images/combat/max-ranged-dmg.png";
import MaxMagicDmgIcon from "../../assets/images/combat/max-maagic-dmg.png";
import CritChanceIcon from "../../assets/images/combat/crit-chance.png";
import CritMulIcon from "../../assets/images/combat/crit-multiplier.png";
import DmgReducIcon from "../../assets/images/combat/dmg-reduction.png";
import MagicDmgReducIcon from "../../assets/images/combat/magic-dmg-reduction.png";
import HPRegenRateIcon from "../../assets/images/combat/hp-regen-rate.png";
import HPRegenAmtIcon from "../../assets/images/combat/hp-regen-amt.png";
import MeleeFactorIcon from "../../assets/images/combat/melee-factor.png";
import RangedFactorIcon from "../../assets/images/combat/ranged-factor.png";
import MagicFactorIcon from "../../assets/images/combat/magic-factor.png";
import ReinforceAirIcon from "../../assets/images/combat/reinforce-air.png";
import ReinforceWaterIcon from "../../assets/images/combat/reinforce-water.png";
import ReinforceEarthIcon from "../../assets/images/combat/reinforce-earth.png";
import ReinforceFireIcon from "../../assets/images/combat/reinforce-fire.png";
import { useEffect, useState } from "react";

function SkillsPage() {
  const { userData, userEfficiencyStats, pumpStats, isUpgradingStats } =
    useUserSocket();

  const [numStrToPump, setNumStrToPump] = useState(0);
  const [numDefToPump, setNumDefToPump] = useState(0);
  const [numDexToPump, setNumDexToPump] = useState(0);
  const [numLukToPump, setNumLukToPump] = useState(0);
  const [numMagicToPump, setNumMagicToPump] = useState(0);
  const [numHpLevelToPump, setNumhpLevelToPump] = useState(0);

  const [remainingPoints, setRemainingPoints] = useState(
    userData.outstandingSkillPoints
  );

  const handlePumpStats = () => {
    if (isUpgradingStats) return;

    pumpStats({
      str: numStrToPump,
      def: numDefToPump,
      dex: numDexToPump,
      luk: numLukToPump,
      magic: numMagicToPump,
      hpLevel: numHpLevelToPump,
    });

    setNumStrToPump(0);
    setNumDefToPump(0);
    setNumDexToPump(0);
    setNumLukToPump(0);
    setNumMagicToPump(0);
    setNumhpLevelToPump(0);
  };

  useEffect(() => {
    setRemainingPoints(
      userData.outstandingSkillPoints -
        numStrToPump -
        numDefToPump -
        numDexToPump -
        numLukToPump -
        numMagicToPump -
        numHpLevelToPump
    );
  }, [
    userData.outstandingSkillPoints,
    numStrToPump,
    numDefToPump,
    numDexToPump,
    numLukToPump,
    numMagicToPump,
    numHpLevelToPump,
  ]);

  function toPercentage(value: number): string {
    return (value * 100).toFixed(1) + "%";
  }

  return (
    <div className="skill-page-container">
      <div className="skills-container">
        <div className="skills-header">Character Stats</div>
        <div className="skills-inner-container">
          <Skill
            skill="str"
            level={userData.str}
            pointsToPump={numStrToPump}
            setPointsToPump={setNumStrToPump}
            canIncrement={remainingPoints > 0}
          />
          <Skill
            skill="def"
            level={userData.def}
            pointsToPump={numDefToPump}
            setPointsToPump={setNumDefToPump}
            canIncrement={remainingPoints > 0}
          />
          <Skill
            skill="dex"
            level={userData.dex}
            pointsToPump={numDexToPump}
            setPointsToPump={setNumDexToPump}
            canIncrement={remainingPoints > 0}
          />
          <Skill
            skill="agi"
            level={userData.luk}
            pointsToPump={numLukToPump}
            setPointsToPump={setNumLukToPump}
            canIncrement={remainingPoints > 0}
          />
          <Skill
            skill="magic"
            level={userData.magic}
            pointsToPump={numMagicToPump}
            setPointsToPump={setNumMagicToPump}
            canIncrement={remainingPoints > 0}
          />
          <Skill
            skill="HP LVL"
            level={userData.hpLevel}
            pointsToPump={numHpLevelToPump}
            setPointsToPump={setNumhpLevelToPump}
            canIncrement={remainingPoints > 0}
          />
          <div className="outstanding-stat-points">
            <div className="stat-points-label">STAT POINTS</div>
            <div className="user-stat-points">{remainingPoints}</div>
          </div>
          {userData.outstandingSkillPoints > 0 && (
            <div
              className={
                isUpgradingStats ||
                remainingPoints === userData.outstandingSkillPoints
                  ? "assign-stats-button disabled"
                  : "assign-stats-button active"
              }
              onClick={() => {
                handlePumpStats();
              }}
            >
              {isUpgradingStats ? "Upgrading..." : "Assign"}
            </div>
          )}
        </div>
      </div>

      <div className="combat-stats-container">
        <div className="combat-stats-header">Combat Stats</div>
        <div className="combat-stats-inner-container">
          <div className="combat-calc-container">
            <div className="combat-calc-header">Stats</div>
            <CombatStat
              statName="MAX HP"
              level={Math.floor(userData.combat?.maxHp || 100)}
              imgsrc={MaxHpIcon}
              fontSize={8}
            />
            <CombatStat
              statName="ATK SPD"
              level={Math.floor(userData.combat?.atkSpd || 10)}
              imgsrc={AtkSpdIcon}
              fontSize={8}
            />
            <CombatStat
              statName="ACC"
              level={Math.floor(userData.combat?.acc || 100)}
              imgsrc={AccIcon}
              fontSize={8}
            />
            <CombatStat
              statName="EVA"
              level={Math.floor(userData.combat?.eva || 100)}
              imgsrc={EvaIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAX MELEE DMG"
              level={Math.floor(userData.combat?.maxMeleeDmg || 20)}
              imgsrc={MaxMeleeDmgIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAX RANGED DMG"
              level={Math.floor(userData.combat?.maxRangedDmg || 20)}
              imgsrc={MaxRangedDmgIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAX MAGIC DMG"
              level={Math.floor(userData.combat?.maxMagicDmg || 20)}
              imgsrc={MaxMagicDmgIcon}
              fontSize={8}
            />
            <CombatStat
              statName="CRIT % CHANCE"
              level={toPercentage(userData.combat?.critChance || 0.006623)}
              imgsrc={CritChanceIcon}
              fontSize={8}
            />
            <CombatStat
              statName="CRIT % DMG"
              level={toPercentage(userData.combat?.critMultiplier || 1.29)}
              imgsrc={CritMulIcon}
              fontSize={8}
            />
            <CombatStat
              statName="DMG REDUCTION"
              level={Math.floor(userData.combat?.dmgReduction || 10)}
              imgsrc={DmgReducIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAGIC DMG REDUCTION"
              level={Math.floor(userData.combat?.magicDmgReduction || 10)}
              imgsrc={MagicDmgReducIcon}
              fontSize={8}
            />
            <CombatStat
              statName="HP REGEN RATE"
              level={(userData.combat?.hpRegenRate || 20).toFixed(1) + "s"}
              imgsrc={HPRegenRateIcon}
              fontSize={8}
            />
            <CombatStat
              statName="HP REGEN AMT"
              level={Math.floor(userData.combat?.hpRegenAmount || 5.7)}
              imgsrc={HPRegenAmtIcon}
              fontSize={8}
            />
          </div>
          <div className="combat-triangle-container">
            <div className="combat-calc-header">Combat Triangle</div>
            <CombatStat
              statName="MELEE FACTOR"
              level={Math.floor(userData.combat?.meleeFactor || 0)}
              imgsrc={MeleeFactorIcon}
              fontSize={8}
            />
            <CombatStat
              statName="RANGED FACTOR"
              level={Math.floor(userData.combat?.rangeFactor || 0)}
              imgsrc={RangedFactorIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAGIC FACTOR"
              level={Math.floor(userData.combat?.magicFactor || 0)}
              imgsrc={MagicFactorIcon}
              fontSize={8}
            />
          </div>
          <div className="reinforce-container">
            <div className="combat-calc-header">Elemental</div>
            <CombatStat
              statName="AIR"
              level={Math.floor(userData.combat?.reinforceAir || 0)}
              imgsrc={ReinforceAirIcon}
              fontSize={8}
            />
            <CombatStat
              statName="WATER"
              level={Math.floor(userData.combat?.reinforceWater || 0)}
              imgsrc={ReinforceWaterIcon}
              fontSize={8}
            />
            <CombatStat
              statName="EARTH"
              level={Math.floor(userData.combat?.reinforceEarth || 0)}
              imgsrc={ReinforceEarthIcon}
              fontSize={8}
            />
            <CombatStat
              statName="FIRE"
              level={Math.floor(userData.combat?.reinforceFire || 0)}
              imgsrc={ReinforceFireIcon}
              fontSize={8}
            />
          </div>
        </div>
      </div>

      <div className="efficiency-stats-container">
        <div className="efficiency-stats-header">Efficiency Stats</div>
        <div className="efficiency-stats-inner-container">
          <div className="efficiency-calc-container">
            <div className="efficiency-calc-header">Resource & Speed</div>
            <EfficiencyStat
              statName="SKILL DURATION RED"
              level={`-${toPercentage(
                userEfficiencyStats.skillIntervalMultiplier
              )}`}
              fontSize={8}
            />
            <EfficiencyStat
              statName="DOUBLE RESOURCE CHANCE"
              level={toPercentage(userEfficiencyStats.doubleResourceChance)}
              fontSize={8}
            />
          </div>
          <div className="efficiency-exp-container">
            <div className="efficiency-calc-header">EXP Bonuses</div>
            <EfficiencyStat
              statName="DOUBLE SKILL EXP CHANCE"
              level={toPercentage(userEfficiencyStats.doubleSkillExpChance)}
              fontSize={8}
            />
            <EfficiencyStat
              statName="DOUBLE COMBAT EXP CHANCE"
              level={toPercentage(userEfficiencyStats.doubleCombatExpChance)}
              fontSize={8}
            />
            <EfficiencyStat
              statName="SKILL EXP BOOST"
              level={`+${toPercentage(userEfficiencyStats.flatSkillExpBoost)}`}
              fontSize={8}
            />
            <EfficiencyStat
              statName="COMBAT EXP BOOST"
              level={`+${toPercentage(userEfficiencyStats.flatCombatExpBoost)}`}
              fontSize={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillsPage;
