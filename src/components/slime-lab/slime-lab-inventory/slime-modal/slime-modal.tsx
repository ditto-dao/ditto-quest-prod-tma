import { useState, useEffect } from "react";
import Separator from "../../../../assets/images/general/separator.svg";
import "./slime-modal.css";
import { SlimeWithTraits } from "../../../../utils/types";
import {
  aggregateStatEffects,
  getHighestDominantTraitRarity,
} from "../../../../utils/helpers";
import { useUserSocket } from "../../../../redux/socket/user/user-context";
import { useIdleSkillSocket } from "../../../../redux/socket/idle/skill-context";
import { useNotification } from "../../../notifications/notification-context";
import SellSlimeNotification from "../sell-slime-modal/sell-slime-modal";
import MeleeFactorIcon from "../../../../assets/images/combat/melee-factor.png";
import RangedFactorIcon from "../../../../assets/images/combat/ranged-factor.png";
import MagicFactorIcon from "../../../../assets/images/combat/magic-factor.png";
import ReinforceAirIcon from "../../../../assets/images/combat/reinforce-air.png";
import ReinforceWaterIcon from "../../../../assets/images/combat/reinforce-water.png";
import ReinforceEarthIcon from "../../../../assets/images/combat/reinforce-earth.png";
import ReinforceFireIcon from "../../../../assets/images/combat/reinforce-fire.png";
import { preloadImageCached } from "../../../../utils/image-cache";
import FastImage from "../../../fast-image/fast-image";

const TRAIT_KEYS = [
  "Body",
  "Pattern",
  "PrimaryColour",
  "Accent",
  "Detail",
  "EyeColour",
  "EyeShape",
  "Mouth",
] as const;

interface SlimeModalProps {
  notificationId: string;
  selectedSlime: SlimeWithTraits | null | undefined;
  closeOnEquip: boolean;
  closeOnUnequip: boolean;
  removeNotification: (id: string) => void;
}

export default function SlimeModal({
  notificationId,
  selectedSlime,
  closeOnEquip,
  closeOnUnequip,
  removeNotification,
}: SlimeModalProps) {
  const { userData, equipSlime, unequipSlime } = useUserSocket();
  const { breedingStatus, slimeToBreed0, slimeToBreed1, setSlimeToBreed } =
    useIdleSkillSocket();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<"traits" | "stats">("traits");
  const [slimeImageLoaded, setSlimeImageLoaded] = useState(false);

  if (!selectedSlime) return;

  // Preload the slime image
  useEffect(() => {
    const preloadSlimeImage = async () => {
      if (selectedSlime?.imageUri) {
        try {
          await preloadImageCached(selectedSlime.imageUri);
          setSlimeImageLoaded(true);
        } catch (error) {
          console.error("Failed to preload slime image:", error);
          setSlimeImageLoaded(true); // Still proceed even if image fails
        }
      } else {
        setSlimeImageLoaded(true); // No image to load
      }
    };

    preloadSlimeImage();
  }, [selectedSlime?.imageUri]);

  const slimeAggregatedStats = aggregateStatEffects([
    selectedSlime.BodyDominant.statEffect,
    selectedSlime.PatternDominant.statEffect,
    selectedSlime.PrimaryColourDominant.statEffect,
    selectedSlime.AccentDominant.statEffect,
    selectedSlime.DetailDominant.statEffect,
    selectedSlime.EyeColourDominant.statEffect,
    selectedSlime.EyeShapeDominant.statEffect,
    selectedSlime.MouthDominant.statEffect,
  ]);

  console.log(JSON.stringify(slimeAggregatedStats, null, 2));

  const isSlimeEquipped = (slimeId: number): boolean => {
    return !!(userData?.equippedSlime?.id === slimeId);
  };

  const canSetSlimeToBreed = (slime: SlimeWithTraits) => {
    return (
      slime.id !== userData.equippedSlime?.id &&
      !breedingStatus &&
      slime.id !== slimeToBreed0?.id &&
      slime.id !== slimeToBreed1?.id
    );
  };

  function formatStatValueAdd(value: number): string {
    const formatted = value.toFixed(2);
    return value >= 0 ? `+${formatted}` : formatted;
  }

  function formatStatValueMul(multiplier: number): string {
    const delta = (multiplier - 1) * 100;
    const formatted = delta.toFixed(1) + "%";
    return delta >= 0 ? `+${formatted}` : formatted;
  }

  return (
    <div className="slime-modal-content">
      {/* Slime Image */}
      <div className="slime-image-container">
        <div
          className="slime-rank-display"
          style={{
            color: `var(--rarity-${getHighestDominantTraitRarity(
              selectedSlime
            )[0].toLowerCase()})`,
          }}
        >
          {getHighestDominantTraitRarity(selectedSlime)}
        </div>
        {slimeImageLoaded ? (
          <FastImage
            src={selectedSlime.imageUri}
            alt={`#${selectedSlime.id}`}
            className={`slime-image rarity-${getHighestDominantTraitRarity(
              selectedSlime
            ).toLowerCase()}`}
          />
        ) : (
          <div className="slime-modal-image-placeholder shimmer" />
        )}
      </div>

      {/* Slime ID and Rarity */}
      <div className="slime-info-row">
        <div className="slime-info-id">{`Slime ${selectedSlime.id}`}</div>
        <FastImage src={Separator} alt="separator" />
        <div className="slime-info-gen">Gen {selectedSlime.generation}</div>
      </div>

      {/* Equip Button */}
      <div className="equip-slime-button-container">
        {isSlimeEquipped(selectedSlime.id) ? (
          <button
            className="equip-slime-button equip-slime-active"
            onClick={() => {
              unequipSlime();
              if (closeOnUnequip) removeNotification(notificationId);
            }}
          >
            Unequip Slime
          </button>
        ) : (
          <button
            className="equip-slime-button"
            onClick={() => {
              equipSlime(selectedSlime);
              if (closeOnEquip) removeNotification(notificationId);
            }}
          >
            Equip Slime
          </button>
        )}
        <button
          className="sell-slime-button"
          onClick={() => {
            addNotification((id) => (
              <SellSlimeNotification
                notificationId={id}
                parentNotificationId={notificationId}
                removeNotification={removeNotification}
                selectedSlime={selectedSlime}
              />
            ));
          }}
          disabled={isSlimeEquipped(selectedSlime.id)}
        >
          Sell
        </button>
      </div>

      {/* Set for Breeding */}
      <div className="set-breed-slime-button-container">
        <button
          className={`set-breed-slime-button ${
            canSetSlimeToBreed(selectedSlime) ? "set-breed-slime-active" : ""
          }`}
          onClick={() => {
            setSlimeToBreed(selectedSlime);
            removeNotification(notificationId);
          }}
          disabled={!canSetSlimeToBreed(selectedSlime)}
        >
          Select for Breeding
        </button>
      </div>

      {/* Tabs */}
      <div className="slime-tabs">
        <button
          className={`slime-tab ${activeTab === "traits" ? "active" : ""}`}
          onClick={() => setActiveTab("traits")}
        >
          Traits
        </button>
        <button
          className={`slime-tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "traits" && (
        <div className="slime-traits">
          {TRAIT_KEYS.map((trait) => {
            const dominant =
              selectedSlime[`${trait}Dominant` as keyof SlimeWithTraits];
            const h1 =
              selectedSlime[`${trait}Hidden1` as keyof SlimeWithTraits];
            const h2 =
              selectedSlime[`${trait}Hidden2` as keyof SlimeWithTraits];
            const h3 =
              selectedSlime[`${trait}Hidden3` as keyof SlimeWithTraits];

            return (
              <div key={trait} className="slime-trait">
                <div className="trait-table-container">
                  <div className="trait-table-label">{trait}</div>
                  <table className="trait-table">
                    <thead>
                      <tr>
                        <th>Gene</th>
                        <th>Name</th>
                        <th>Rarity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[dominant, h1, h2, h3].map((row, index) => (
                        <tr
                          key={index}
                          /*                           onClick={() =>
                            addNotification((id) => (
                              <TraitModal
                                notificationId={id}
                                removeNotification={removeNotification}
                                selectedTrait={row as SlimeTrait}
                              />
                            ))
                          } */
                        >
                          <td>{index === 0 ? "D" : `H${index}`}</td>
                          <td>{(row as any).name}</td>
                          <td>
                            <div
                              className={`trait-rarity rarity-${(
                                row as any
                              ).rarity.toLowerCase()}`}
                            >
                              {(row as any).rarity}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="slime-stats">
          <div className="stats-section">
            <div className="stats-header">Combat Stats</div>
            <div className="stats-grid">
              {slimeAggregatedStats.maxHp.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAX HP</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.maxHp.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.maxHp.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAX HP</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.maxHp.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.atkSpd.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">ATK SPD</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.atkSpd.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.atkSpd.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">ATK SPD</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.atkSpd.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.acc.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">ACC</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.acc.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.acc.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">ACC</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.acc.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.eva.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">EVA</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.eva.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.eva.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">EVA</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.eva.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.maxMeleeDmg.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAX MELEE DMG</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.maxMeleeDmg.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.maxMeleeDmg.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAX MELEE DMG</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.maxMeleeDmg.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.maxRangedDmg.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAX RANGED DMG</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.maxRangedDmg.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.maxRangedDmg.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAX RANGED DMG</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.maxRangedDmg.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.maxMagicDmg.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAX MAGIC DMG</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.maxMagicDmg.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.maxMagicDmg.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAX MAGIC DMG</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.maxMagicDmg.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.critChance.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">CRIT % CHANCE</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.critChance.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.critChance.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">CRIT % CHANCE</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.critChance.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.critMultiplier.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">CRIT % DMG</span>
                  <span className="stat-value">
                    {formatStatValueAdd(
                      slimeAggregatedStats.critMultiplier.add
                    )}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.critMultiplier.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">CRIT % DMG</span>
                  <span className="stat-value">
                    {formatStatValueMul(
                      slimeAggregatedStats.critMultiplier.mul
                    )}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.dmgReduction.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">DMG RED</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.dmgReduction.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.dmgReduction.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">DMG RED</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.dmgReduction.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.magicDmgReduction.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAGIC DMG RED</span>
                  <span className="stat-value">
                    {formatStatValueAdd(
                      slimeAggregatedStats.magicDmgReduction.add
                    )}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.magicDmgReduction.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">MAGIC DMG RED</span>
                  <span className="stat-value">
                    {formatStatValueMul(
                      slimeAggregatedStats.magicDmgReduction.mul
                    )}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.hpRegenRate.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">HP REGEN RATE</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.hpRegenRate.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.hpRegenRate.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">HP REGEN RATE</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.hpRegenRate.mul)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.hpRegenAmount.add !== 0 && (
                <div className="combat-stat-item">
                  <span className="stat-label">HP REGEN AMT</span>
                  <span className="stat-value">
                    {formatStatValueAdd(slimeAggregatedStats.hpRegenAmount.add)}
                  </span>
                </div>
              )}
              {slimeAggregatedStats.hpRegenAmount.mul !== 1 && (
                <div className="combat-stat-item">
                  <span className="stat-label">HP REGEN AMT</span>
                  <span className="stat-value">
                    {formatStatValueMul(slimeAggregatedStats.hpRegenAmount.mul)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Special Stats */}
          {/* Combat Triangle Section */}
          <div className="stats-section">
            <div className="stats-special-header">Combat Triangle</div>
            <div className="stats-grid-special">
              <div className="special-stat-item">
                <FastImage
                  src={MeleeFactorIcon}
                  className="stat-icon"
                  alt="Melee Factor"
                />
                <span className="stat-value">
                  {formatStatValueAdd(slimeAggregatedStats.meleeFactor)}
                </span>
              </div>
              <div className="special-stat-item">
                <FastImage
                  src={RangedFactorIcon}
                  className="stat-icon"
                  alt="Ranged Factor"
                />
                <span className="stat-value">
                  {formatStatValueAdd(slimeAggregatedStats.rangeFactor)}
                </span>
              </div>
              <div className="special-stat-item">
                <FastImage
                  src={MagicFactorIcon}
                  className="stat-icon"
                  alt="Magic Factor"
                />
                <span className="stat-value">
                  {formatStatValueAdd(slimeAggregatedStats.magicFactor)}
                </span>
              </div>
            </div>
          </div>

          {/* Elemental Reinforce Section */}
          <div className="stats-section">
            <div className="stats-special-header">Elemental</div>
            <div className="stats-grid-special">
              <div className="special-stat-item">
                <FastImage
                  src={ReinforceAirIcon}
                  className="stat-icon"
                  alt="Air Reinforce"
                />
                <span className="stat-value">
                  {formatStatValueAdd(slimeAggregatedStats.reinforceAir)}
                </span>
              </div>
              <div className="special-stat-item">
                <FastImage
                  src={ReinforceWaterIcon}
                  className="stat-icon"
                  alt="Water Reinforce"
                />
                <span className="stat-value">
                  {formatStatValueAdd(slimeAggregatedStats.reinforceWater)}
                </span>
              </div>
              <div className="special-stat-item">
                <FastImage
                  src={ReinforceEarthIcon}
                  className="stat-icon"
                  alt="Earth Reinforce"
                />
                <span className="stat-value">
                  {formatStatValueAdd(slimeAggregatedStats.reinforceEarth)}
                </span>
              </div>
              <div className="special-stat-item">
                <FastImage
                  src={ReinforceFireIcon}
                  className="stat-icon"
                  alt="Fire Reinforce"
                />
                <span className="stat-value">
                  {formatStatValueAdd(slimeAggregatedStats.reinforceFire)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
