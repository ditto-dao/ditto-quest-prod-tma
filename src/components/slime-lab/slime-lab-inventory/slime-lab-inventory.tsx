import { useState } from "react";
import Modal from "react-modal";
import "./slime-lab-inventory.css";
import { SlimeWithTraits } from "../../../utils/types";
import { getHighestDominantTraitRarity } from "../../../utils/helpers";
import { useIdleSkillSocket } from "../../../redux/socket/idle/skill-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import SlimeModal from "./slime-modal/slime-modal";

interface SlimeLabInventoryProps {
  slimes: SlimeWithTraits[];
  equippedSlimeId?: number;
}

function SlimeLabInventory({
  slimes,
  equippedSlimeId,
}: SlimeLabInventoryProps) {
  const { setSlimeToBreed, breedingStatus, slimeToBreed0, slimeToBreed1 } =
    useIdleSkillSocket();
  const { userData, equipSlime, unequipSlime } = useUserSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlime, setSelectedSlime] = useState<SlimeWithTraits | null>(
    null
  );

  const openModal = (slime: SlimeWithTraits) => {
    setSelectedSlime(slime);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlime(null);
    setTimeout(() => setSelectedSlime(null), 300); // delay cleanup to avoid flicker
  };

  const canSetSlimeToBreed = (slime: SlimeWithTraits) => {
    return (
      slime.id !== userData.equippedSlime?.id &&
      !breedingStatus &&
      slime.id !== slimeToBreed0?.id &&
      slime.id !== slimeToBreed1?.id
    );
  };

  const isSlimeEquipped = (slimeId: number): boolean => {
    return !!(userData?.equippedSlime?.id === slimeId);
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Slime Details"
        className="slime-modal"
        overlayClassName="slime-modal-overlay"
      >
        {selectedSlime && (
          <SlimeModal
            selectedSlime={selectedSlime}
            isSlimeEquipped={isSlimeEquipped}
            canSetSlimeToBreed={canSetSlimeToBreed}
            equipSlime={equipSlime}
            unequipSlime={unequipSlime}
            setSlimeToBreed={setSlimeToBreed}
            onRequestClose={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}

export default SlimeLabInventory;
