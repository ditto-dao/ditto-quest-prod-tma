import "./slime-lab-inventory.css";
import { SlimeWithTraits } from "../../../utils/types";
import { getHighestDominantTraitRarity } from "../../../utils/helpers";
import SlimeModal from "./slime-modal/slime-modal";
import { useNotification } from "../../notifications/notification-context";

interface SlimeLabInventoryProps {
  slimes: SlimeWithTraits[];
  equippedSlimeId?: number;
}

function SlimeLabInventory({
  slimes,
  equippedSlimeId,
}: SlimeLabInventoryProps) {
  const { addNotification, removeNotification } = useNotification();

  const openModal = (slime: SlimeWithTraits) => {
    addNotification((id) => (
      <SlimeModal
        notificationId={id}
        removeNotification={removeNotification}
        selectedSlime={slime}
      />
    ));
  };

  return (
    <div className="slime-lab-root">
      <div className="slime-lab-inventory-wrapper">
        <div className="slime-lab-inventory-header">Slimes</div>
        <div id="slime-lab-inventory-container" className="inventory-grid">
          {slimes.length > 0
            ? slimes.map((slime) => (
                <div
                  key={slime.id}
                  className={`slime-inventory-item ${
                    slime.id === equippedSlimeId ? "equipped-slime" : ""
                  }`}
                  onClick={() => openModal(slime)}
                >
                  <img
                    className={`slime-inventory-img rarity-${getHighestDominantTraitRarity(
                      slime
                    ).toLowerCase()}`}
                    src={slime.imageUri}
                  ></img>
                  <div className="slime-name-container">
                    <div className="slime-name">{`Slime ${slime.id}`}</div>
                  </div>
                </div>
              ))
            : Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="slime-inventory-item empty"
                ></div>
              ))}

          {slimes.length > 0 && slimes.length % 2 !== 0 && (
            <div className="slime-inventory-item empty"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SlimeLabInventory;
