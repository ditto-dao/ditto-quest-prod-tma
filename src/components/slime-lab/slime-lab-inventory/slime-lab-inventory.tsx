import "./slime-lab-inventory.css";
import { SlimeWithTraits } from "../../../utils/types";
import { getHighestDominantTraitRarity } from "../../../utils/helpers";
import SlimeModal from "./slime-modal/slime-modal";
import { useNotification } from "../../notifications/notification-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import { MAX_INITIAL_SLIME_INVENTORY_SLOTS } from "../../../utils/config";

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

  const maxSlots =
    userData?.maxSlimeInventorySlots ?? MAX_INITIAL_SLIME_INVENTORY_SLOTS;

  const paddedSlimes = padSlimesToMax(slimes, maxSlots);

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
                <img
                  className={`slime-inventory-img rarity-${getHighestDominantTraitRarity(
                    slime
                  ).toLowerCase()}`}
                  src={slime.imageUri}
                />
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
