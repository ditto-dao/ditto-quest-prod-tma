import { useUserSocket } from "../../redux/socket/user/user-context";
import CombatStat from "./combat-stat/combat-stat";
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

function SkillsPage() {
  const { userData } = useUserSocket();

  function toPercentage(value: number): string {
    return (value * 100).toFixed(2) + "%";
  }

  return (
    <div className="skill-page-container">
      <div className="skills-container">
        <div className="skills-header">Character Stats</div>
        <div className="skills-inner-container">
          <Skill skill="str" level={userData.str} />
          <Skill skill="def" level={userData.def} />
          <Skill skill="dex" level={userData.dex} />
          <Skill skill="luk" level={userData.luk} />
          <Skill skill="magic" level={userData.magic} />
          <Skill skill="maxhp" level={userData.hpLevel} />
        </div>
      </div>
      <div className="combat-stats-container">
        <div className="combat-stats-header">Combat Stats</div>
        <div className="combat-stats-inner-container">
          <div className="combat-calc-container">
            <div className="combat-calc-header">Stats</div>
            <CombatStat
              statName="MAX HP"
              level={userData.combat?.maxHp || 100}
              imgsrc={MaxHpIcon}
              fontSize={8}
            />
            <CombatStat
              statName="ATK SPD"
              level={userData.combat?.atkSpd || 10}
              imgsrc={AtkSpdIcon}
              fontSize={8}
            />
            <CombatStat
              statName="ACC"
              level={userData.combat?.acc || 100}
              imgsrc={AccIcon}
              fontSize={8}
            />
            <CombatStat
              statName="EVA"
              level={userData.combat?.eva || 100}
              imgsrc={EvaIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAX MELEE DMG"
              level={userData.combat?.maxMeleeDmg || 20}
              imgsrc={MaxMeleeDmgIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAX RANGED DMG"
              level={userData.combat?.maxRangedDmg || 20}
              imgsrc={MaxRangedDmgIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAX MAGIC DMG"
              level={userData.combat?.maxMagicDmg || 20}
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
              level={toPercentage(userData.combat?.critMultiplier || 1.290)}
              imgsrc={CritMulIcon}
              fontSize={8}
            />

            <CombatStat
              statName="DMG REDUCTION"
              level={userData.combat?.dmgReduction || 10}
              imgsrc={DmgReducIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAGIC DMG REDUCTION"
              level={userData.combat?.magicDmgReduction || 10}
              imgsrc={MagicDmgReducIcon}
              fontSize={8}
            />
            <CombatStat
              statName="HP REGEN RATE"
              level={(userData.combat?.hpRegenRate || 20).toString() + "s"}
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
              level={userData.combat?.meleeFactor || 0}
              imgsrc={MeleeFactorIcon}
              fontSize={8}
            />
            <CombatStat
              statName="RANGED FACTOR"
              level={userData.combat?.rangeFactor || 0}
              imgsrc={RangedFactorIcon}
              fontSize={8}
            />
            <CombatStat
              statName="MAGIC FACTOR"
              level={userData.combat?.magicFactor || 0}
              imgsrc={MagicFactorIcon}
              fontSize={8}
            />
          </div>
          <div className="reinforce-container">
          <div className="combat-calc-header">Elemental</div>

            <CombatStat
              statName="AIR"
              level={userData.combat?.reinforceAir || 0}
              imgsrc={ReinforceAirIcon}
              fontSize={8}
            />
            <CombatStat
              statName="WATER"
              level={userData.combat?.reinforceWater || 0}
              imgsrc={ReinforceWaterIcon}
              fontSize={8}
            />
            <CombatStat
              statName="EARTH"
              level={userData.combat?.reinforceEarth || 0}
              imgsrc={ReinforceEarthIcon}
              fontSize={8}
            />
            <CombatStat
              statName="FIRE"
              level={userData.combat?.reinforceFire || 0}
              imgsrc={ReinforceFireIcon}
              fontSize={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillsPage;
