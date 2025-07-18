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
import { preloadImageCached } from "../../../../utils/image-cache";
import FastImage from "../../../fast-image/fast-image";
import CombatStats from "../../../combat-stats/combat-stats";
import { useSocket } from "../../../../redux/socket/socket-context";
import { ADD_STICKERS_FOR_SLIME } from "../../../../utils/events";
import TGStickerIcon from ".././../../../assets/images/general/tg-sticker.png";

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
  const { socket } = useSocket();
  const {
    userData,
    equipSlime,
    unequipSlime,
    canEmitEvent,
    setLastEventEmittedTimestamp,
    canGenerateStickers,
    setCanGenerateStickers,
  } = useUserSocket();
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

  const generateStickers = () => {
    if (socket && canEmitEvent()) {
      console.log(`Emitting ADD_STICKERS_FOR_SLIME`);
      socket.emit(ADD_STICKERS_FOR_SLIME, selectedSlime.id);
      setLastEventEmittedTimestamp(Date.now());
      setCanGenerateStickers(false);
    }
  };

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
            )[0].toLowerCase()}`}
          />
        ) : (
          <div className="slime-modal-image-placeholder shimmer" />
        )}
        <div
          className={`export-sticker-button ${
            !canGenerateStickers ? "disabled" : ""
          }`}
          onClick={() => {
            if (canGenerateStickers) generateStickers();
          }}
        >
          {!canGenerateStickers ? (
            <div className="loading-spinner"></div>
          ) : (
            <img src={TGStickerIcon} alt="Telegram Sticker" />
          )}
          <span>TG Stickers</span>
        </div>
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

      {/* Stats Tab Content */}
      {activeTab === "stats" && (
        <CombatStats stats={slimeAggregatedStats} colorScheme="slime" />
      )}
    </div>
  );
}
