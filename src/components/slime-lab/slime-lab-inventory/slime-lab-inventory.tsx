import "./slime-lab-inventory.css";
import { SlimeWithTraits } from "../../../utils/types";
import { getHighestDominantTraitRarity } from "../../../utils/helpers";
import SlimeModal from "./slime-modal/slime-modal";
import { useNotification } from "../../notifications/notification-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import { MAX_INITIAL_SLIME_INVENTORY_SLOTS } from "../../../utils/config";
import { useState, useEffect } from "react";
import { preloadImagesBatch } from "../../../utils/image-cache";
import FastImage from "../../fast-image/fast-image";

interface SlimeLabInventoryProps {
  slimes: SlimeWithTraits[];
  equippedSlimeId?: number;
}

function SlimeLabInventory({
  slimes,
  equippedSlimeId,
}: SlimeLabInventoryProps) {
  const { userData } = useUserSocket();
  const { addNotification, removeNotification } = useNotification();
  const [slimeImagesLoaded, setSlimeImagesLoaded] = useState(false);

  const maxSlots =
    userData?.maxSlimeInventorySlots ?? MAX_INITIAL_SLIME_INVENTORY_SLOTS;

  const paddedSlimes = padSlimesToMax(slimes, maxSlots);

  // Preload slime images when slimes change
  useEffect(() => {
    const preloadSlimeInventoryImages = async () => {
      const slimeImages = slimes
        .map((slime) => slime.imageUri)
        .filter(Boolean) as string[];

      if (slimeImages.length > 0) {
        try {
          await preloadImagesBatch(slimeImages);
          setSlimeImagesLoaded(true);
        } catch (error) {
          console.error(
            "Failed to preload some slime inventory images:",
            error
          );
          setSlimeImagesLoaded(true); // Still proceed even if some images fail
        }
      } else {
        setSlimeImagesLoaded(true); // No images to load
      }
    };

    preloadSlimeInventoryImages();
  }, [slimes]);

  function padSlimesToMax(
    slimes: SlimeWithTraits[],
    maxSlots: number
  ): (SlimeWithTraits | null)[] {
    const padded: (SlimeWithTraits | null)[] = [...slimes];
    while (padded.length < maxSlots) {
      padded.push(null);
    }
    return padded;
  }

  const openModal = (slime: SlimeWithTraits) => {
    addNotification((id) => (
      <SlimeModal
        notificationId={id}
        removeNotification={removeNotification}
        closeOnEquip={false}
        closeOnUnequip={false}
        selectedSlime={slime}
      />
    ));
  };

  return (
    <div className="slime-lab-root">
      <div className="slime-lab-inventory-wrapper">
        <div className="slime-lab-inventory-header">Slimes</div>
        <div id="slime-lab-inventory-container" className="inventory-grid">
          {paddedSlimes.map((slime, index) =>
            slime ? (
              <div
                key={slime.id}
                className={`slime-inventory-item ${
                  slime.id === equippedSlimeId ? "equipped-slime" : ""
                }`}
                onClick={() => openModal(slime)}
              >
                <div
                  className="slime-rank-display"
                  style={{
                    color: `var(--rarity-${getHighestDominantTraitRarity(
                      slime
                    ).toLowerCase()})`,
                  }}
                >
                  {getHighestDominantTraitRarity(slime)}
                </div>
                {slimeImagesLoaded ? (
                  <FastImage
                    className={`slime-inventory-img rarity-${getHighestDominantTraitRarity(
                      slime
                    ).toLowerCase()}`}
                    src={slime.imageUri}
                    alt={`Slime ${slime.id}`}
                  />
                ) : (
                  <div className="slime-image-placeholder shimmer" />
                )}
                <div className="slime-name-container">
                  <div className="slime-name">{`Slime ${slime.id}`}</div>
                </div>
              </div>
            ) : (
              <div
                key={`empty-${index}`}
                className="slime-inventory-item empty"
              ></div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default SlimeLabInventory;
