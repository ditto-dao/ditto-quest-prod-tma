import FastImage from "../fast-image/fast-image";
import MeleeFactorIcon from "../../assets/images/combat/melee-factor.png";
import RangedFactorIcon from "../../assets/images/combat/ranged-factor.png";
import MagicFactorIcon from "../../assets/images/combat/magic-factor.png";
import ReinforceAirIcon from "../../assets/images/combat/reinforce-air.png";
import ReinforceWaterIcon from "../../assets/images/combat/reinforce-water.png";
import ReinforceEarthIcon from "../../assets/images/combat/reinforce-earth.png";
import ReinforceFireIcon from "../../assets/images/combat/reinforce-fire.png";
import "./combat-stats.css";
import { AggregatedStatEffects } from "../../utils/helpers";

interface CombatStatsProps {
  stats: AggregatedStatEffects;
  colorScheme?: "slime" | "item";
}

// Helper functions for formatting stat values
const formatStatValueAdd = (value: number): string => {
  if (value === 0) return "0";
  const formatted = value.toFixed(2);
  return value > 0 ? `+${formatted}` : `${formatted}`;
};

const formatStatValueMul = (value: number): string => {
  if (value === 1) return "×1";
  const delta = (value - 1) * 100;
  const formatted = delta.toFixed(1) + "%";
  return delta > 0 ? `+${formatted}` : `${formatted}`;
};

export default function CombatStats({
  stats,
  colorScheme = "slime",
}: CombatStatsProps) {
  const cssPrefix = colorScheme === "slime" ? "slime" : "item";

  // Check if any combat stats exist
  const hasCombatStats = [
    stats.maxHp.add !== 0 || stats.maxHp.mul !== 1,
    stats.atkSpd.add !== 0 || stats.atkSpd.mul !== 1,
    stats.acc.add !== 0 || stats.acc.mul !== 1,
    stats.eva.add !== 0 || stats.eva.mul !== 1,
    stats.maxMeleeDmg.add !== 0 || stats.maxMeleeDmg.mul !== 1,
    stats.maxRangedDmg.add !== 0 || stats.maxRangedDmg.mul !== 1,
    stats.maxMagicDmg.add !== 0 || stats.maxMagicDmg.mul !== 1,
    stats.critChance.add !== 0 || stats.critChance.mul !== 1,
    stats.critMultiplier.add !== 0 || stats.critMultiplier.mul !== 1,
    stats.dmgReduction.add !== 0 || stats.dmgReduction.mul !== 1,
    stats.magicDmgReduction.add !== 0 || stats.magicDmgReduction.mul !== 1,
    stats.hpRegenRate.add !== 0 || stats.hpRegenRate.mul !== 1,
    stats.hpRegenAmount.add !== 0 || stats.hpRegenAmount.mul !== 1,
  ].some(Boolean);

  // Check if any combat triangle stats exist
  const hasCombatTriangle = [
    stats.meleeFactor !== 0,
    stats.rangeFactor !== 0,
    stats.magicFactor !== 0,
  ].some(Boolean);

  // Check if any elemental stats exist
  const hasElementalStats = [
    stats.reinforceAir !== 0,
    stats.reinforceWater !== 0,
    stats.reinforceEarth !== 0,
    stats.reinforceFire !== 0,
  ].some(Boolean);

  const hasEfficiencyStats = [
    stats.efficiencySkillIntervalMod !== 0,
    stats.efficiencyDoubleResourceMod !== 0,
    stats.efficiencyDoubleSkillExpMod !== 0,
    stats.efficiencyDoubleCombatExpMod !== 0,
    stats.efficiencyFlatSkillExpMod !== 0,
    stats.efficiencyFlatCombatExpMod !== 0,
  ].some(Boolean);

  if (
    !hasCombatStats &&
    !hasCombatTriangle &&
    !hasElementalStats &&
    !hasEfficiencyStats
  ) {
    return null; // Don't render anything if no stats
  }

  return (
    <div className={`${cssPrefix}-stats`}>
      {/* Combat Stats Section */}
      {hasCombatStats && (
        <div className="stats-section">
          <div className="stats-header">Combat Stats</div>
          <div className="stats-grid">
            {stats.maxHp.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAX HP</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.maxHp.add)}
                </span>
              </div>
            )}
            {stats.maxHp.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAX HP</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.maxHp.mul)}
                </span>
              </div>
            )}
            {stats.atkSpd.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">ATK SPD</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.atkSpd.add)}
                </span>
              </div>
            )}
            {stats.atkSpd.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">ATK SPD</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.atkSpd.mul)}
                </span>
              </div>
            )}
            {stats.acc.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">ACC</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.acc.add)}
                </span>
              </div>
            )}
            {stats.acc.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">ACC</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.acc.mul)}
                </span>
              </div>
            )}
            {stats.eva.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">EVA</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.eva.add)}
                </span>
              </div>
            )}
            {stats.eva.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">EVA</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.eva.mul)}
                </span>
              </div>
            )}
            {stats.maxMeleeDmg.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAX MELEE DMG</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.maxMeleeDmg.add)}
                </span>
              </div>
            )}
            {stats.maxMeleeDmg.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAX MELEE DMG</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.maxMeleeDmg.mul)}
                </span>
              </div>
            )}
            {stats.maxRangedDmg.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAX RANGED DMG</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.maxRangedDmg.add)}
                </span>
              </div>
            )}
            {stats.maxRangedDmg.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAX RANGED DMG</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.maxRangedDmg.mul)}
                </span>
              </div>
            )}
            {stats.maxMagicDmg.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAX MAGIC DMG</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.maxMagicDmg.add)}
                </span>
              </div>
            )}
            {stats.maxMagicDmg.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAX MAGIC DMG</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.maxMagicDmg.mul)}
                </span>
              </div>
            )}
            {stats.critChance.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">CRIT % CHANCE</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.critChance.add)}
                </span>
              </div>
            )}
            {stats.critChance.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">CRIT % CHANCE</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.critChance.mul)}
                </span>
              </div>
            )}
            {stats.critMultiplier.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">CRIT % DMG</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.critMultiplier.add)}
                </span>
              </div>
            )}
            {stats.critMultiplier.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">CRIT % DMG</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.critMultiplier.mul)}
                </span>
              </div>
            )}
            {stats.dmgReduction.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">DMG RED</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.dmgReduction.add)}
                </span>
              </div>
            )}
            {stats.dmgReduction.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">DMG RED</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.dmgReduction.mul)}
                </span>
              </div>
            )}
            {stats.magicDmgReduction.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAGIC DMG RED</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.magicDmgReduction.add)}
                </span>
              </div>
            )}
            {stats.magicDmgReduction.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">MAGIC DMG RED</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.magicDmgReduction.mul)}
                </span>
              </div>
            )}
            {stats.hpRegenRate.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">HP REGEN RATE</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.hpRegenRate.add)}
                </span>
              </div>
            )}
            {stats.hpRegenRate.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">HP REGEN RATE</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.hpRegenRate.mul)}
                </span>
              </div>
            )}
            {stats.hpRegenAmount.add !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">HP REGEN AMT</span>
                <span className="stat-value">
                  {formatStatValueAdd(stats.hpRegenAmount.add)}
                </span>
              </div>
            )}
            {stats.hpRegenAmount.mul !== 1 && (
              <div className="combat-stat-item">
                <span className="stat-label">HP REGEN AMT</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.hpRegenAmount.mul)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Combat Triangle Section */}
      {hasCombatTriangle && (
        <div className="stats-section">
          <div className="stats-special-header">Combat Triangle</div>
          <div className="stats-grid-special">
            {stats.meleeFactor !== 0 && (
              <div className="special-stat-item">
                <div className="special-stat-item-left">
                  <FastImage
                    src={MeleeFactorIcon}
                    className="stat-icon"
                    alt="Melee Factor"
                  />
                  <span className="stat-label">MELEE</span>
                </div>
                <span className="stat-value">
                  {formatStatValueAdd(stats.meleeFactor)}
                </span>
              </div>
            )}
            {stats.rangeFactor !== 0 && (
              <div className="special-stat-item">
                <div className="special-stat-item-left">
                  <FastImage
                    src={RangedFactorIcon}
                    className="stat-icon"
                    alt="Ranged Factor"
                  />
                  <span className="stat-label">RANGED</span>
                </div>
                <span className="stat-value">
                  {formatStatValueAdd(stats.rangeFactor)}
                </span>
              </div>
            )}
            {stats.magicFactor !== 0 && (
              <div className="special-stat-item">
                <div className="special-stat-item-left">
                  <FastImage
                    src={MagicFactorIcon}
                    className="stat-icon"
                    alt="Magic Factor"
                  />
                  <span className="stat-label">MAGIC</span>
                </div>
                <span className="stat-value">
                  {formatStatValueAdd(stats.magicFactor)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Elemental Reinforcement Section */}
      {hasElementalStats && (
        <div className="stats-section">
          <div className="stats-special-header">Elemental Reinforcement</div>
          <div className="stats-grid-special">
            {stats.reinforceAir !== 0 && (
              <div className="special-stat-item">
                <div className="special-stat-item-left">
                  <FastImage
                    src={ReinforceAirIcon}
                    className="stat-icon"
                    alt="Reinforce Air"
                  />
                  <span className="stat-label">AIR</span>
                </div>
                <span className="stat-value">
                  {formatStatValueAdd(stats.reinforceAir)}
                </span>
              </div>
            )}
            {stats.reinforceWater !== 0 && (
              <div className="special-stat-item">
                <div className="special-stat-item-left">
                  <FastImage
                    src={ReinforceWaterIcon}
                    className="stat-icon"
                    alt="Reinforce Water"
                  />
                  <span className="stat-label">WATER</span>
                </div>
                <span className="stat-value">
                  {formatStatValueAdd(stats.reinforceWater)}
                </span>
              </div>
            )}
            {stats.reinforceEarth !== 0 && (
              <div className="special-stat-item">
                <div className="special-stat-item-left">
                  <FastImage
                    src={ReinforceEarthIcon}
                    className="stat-icon"
                    alt="Reinforce Earth"
                  />
                  <span className="stat-label">EARTH</span>
                </div>
                <span className="stat-value">
                  {formatStatValueAdd(stats.reinforceEarth)}
                </span>
              </div>
            )}
            {stats.reinforceFire !== 0 && (
              <div className="special-stat-item">
                <div className="special-stat-item-left">
                  <FastImage
                    src={ReinforceFireIcon}
                    className="stat-icon"
                    alt="Reinforce Fire"
                  />
                  <span className="stat-label">FIRE</span>
                </div>
                <span className="stat-value">
                  {formatStatValueAdd(stats.reinforceFire)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Efficiency Section */}
      {hasEfficiencyStats && (
        <div className="stats-section">
          <div className="stats-header">Efficiency</div>
          <div className="stats-grid">
            {stats.efficiencySkillIntervalMod !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">SKILL INTERVAL RED</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.efficiencySkillIntervalMod)}
                </span>
              </div>
            )}
            {stats.efficiencyDoubleResourceMod !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">DBL RESOURCE CHANCE</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.efficiencyDoubleResourceMod)}
                </span>
              </div>
            )}
            {stats.efficiencyDoubleSkillExpMod !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">DBL SKILL EXP CHANCE</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.efficiencyDoubleSkillExpMod)}
                </span>
              </div>
            )}
            {stats.efficiencyDoubleCombatExpMod !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">DBL COMBAT EXP CHANCE</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.efficiencyDoubleCombatExpMod)}
                </span>
              </div>
            )}
            {stats.efficiencyFlatSkillExpMod !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">SKILL EXP BOOST</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.efficiencyFlatSkillExpMod)}
                </span>
              </div>
            )}
            {stats.efficiencyFlatCombatExpMod !== 0 && (
              <div className="combat-stat-item">
                <span className="stat-label">COMBAT EXP BOOST</span>
                <span className="stat-value">
                  {formatStatValueMul(stats.efficiencyFlatCombatExpMod)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
