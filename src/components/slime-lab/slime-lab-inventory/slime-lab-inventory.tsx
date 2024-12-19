import { useState } from "react";
import Modal from "react-modal";
import "./slime-lab-inventory.css";
import { SlimeWithTraits } from "../../../utils/types";
import BasicSlimeImg from "../../../assets/ditto-on-cloud.png";
import DQLogo from "../../../assets/images/general/dq-logo.png";
import Separator from "../../../assets/images/general/separator.svg";
import { getHighestDominantTraitRarity } from "../../../utils/helpers";
import { useIdleSocket } from "../../../redux/socket/idle/idle-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";

interface SlimeLabInventoryProps {
  slimes: SlimeWithTraits[];
  equippedSlimeId?: number;
}

function SlimeLabInventory({
  slimes,
  equippedSlimeId,
}: SlimeLabInventoryProps) {
  const { setSlimeToBreed, breedingStatus, slimeToBreed0, slimeToBreed1 } = useIdleSocket();
  const { userData } = useUserSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlime, setSelectedSlime] = useState<SlimeWithTraits | null>(
    null
  );

  const openModal = (slime: SlimeWithTraits) => {
    setSelectedSlime(slime);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSlime(null);
    setIsModalOpen(false);
  };
  
  const canSetSlimeToBreed = (slime: SlimeWithTraits) => {
    return slime.id !== userData.equippedSlime?.id && !breedingStatus && slime.id !== slimeToBreed0?.id && slime.id !== slimeToBreed1?.id;
  }

  return (
    <div className="slime-lab-root">
      <div className="slime-lab-inventory-wrapper">
        <div className="slime-lab-inventory-header">Slimes</div>
        <div id="slime-lab-inventory-container" className="inventory-grid">
          {slimes.map((slime) => (
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
                src={DQLogo}
              ></img>
              <div className="slime-name-container">
                <div className="slime-name">{`Slime #${slime.id}`}</div>
              </div>
            </div>
          ))}
          {/* Add an empty box if the number of slimes is odd */}
          {slimes.length % 2 !== 0 && (
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
          <div className="slime-modal-content">
            <button onClick={closeModal} className="close-modal-button">
              X
            </button>
            {/* Slime Image */}
            <div className="slime-image-container">
              <img
                src={BasicSlimeImg}
                alt={`Slime #${selectedSlime.id}`}
                className={`slime-image rarity-${getHighestDominantTraitRarity(
                  selectedSlime
                ).toLowerCase()}`}
              />
            </div>

            {/* Slime ID and Rarity */}
            <div className="slime-info-row">
              <div className="slime-info-id">{`Slime #${selectedSlime.id}`}</div>
              <img src={Separator}></img>
              <div className="slime-info-gen">
                Gen {selectedSlime.generation}
              </div>
            </div>

            {/* Slime Traits */}
            <div className="slime-traits">
              {[
                {
                  trait: "Aura",
                  dominant: selectedSlime.AuraDominant,
                  h1: selectedSlime.AuraHidden1,
                  h2: selectedSlime.AuraHidden2,
                  h3: selectedSlime.AuraHidden3,
                },
                {
                  trait: "Body",
                  dominant: selectedSlime.BodyDominant,
                  h1: selectedSlime.BodyHidden1,
                  h2: selectedSlime.BodyHidden2,
                  h3: selectedSlime.BodyHidden3,
                },
                {
                  trait: "Core",
                  dominant: selectedSlime.CoreDominant,
                  h1: selectedSlime.CoreHidden1,
                  h2: selectedSlime.CoreHidden2,
                  h3: selectedSlime.CoreHidden3,
                },
                {
                  trait: "Headpiece",
                  dominant: selectedSlime.HeadpieceDominant,
                  h1: selectedSlime.HeadpieceHidden1,
                  h2: selectedSlime.HeadpieceHidden2,
                  h3: selectedSlime.HeadpieceHidden3,
                },
                {
                  trait: "Tail",
                  dominant: selectedSlime.TailDominant,
                  h1: selectedSlime.TailHidden1,
                  h2: selectedSlime.TailHidden2,
                  h3: selectedSlime.TailHidden3,
                },
                {
                  trait: "Arms",
                  dominant: selectedSlime.ArmsDominant,
                  h1: selectedSlime.ArmsHidden1,
                  h2: selectedSlime.ArmsHidden2,
                  h3: selectedSlime.ArmsHidden3,
                },
                {
                  trait: "Eyes",
                  dominant: selectedSlime.EyesDominant,
                  h1: selectedSlime.EyesHidden1,
                  h2: selectedSlime.EyesHidden2,
                  h3: selectedSlime.EyesHidden3,
                },
                {
                  trait: "Mouth",
                  dominant: selectedSlime.MouthDominant,
                  h1: selectedSlime.MouthHidden1,
                  h2: selectedSlime.MouthHidden2,
                  h3: selectedSlime.MouthHidden3,
                },
              ].map(({ trait, dominant, h1, h2, h3 }) => (
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
                        <tr>
                          <td>D</td>
                          <td>{dominant.name}</td>
                          <td>
                            <div
                              className={`trait-rarity rarity-${dominant.rarity.toLowerCase()}`}
                            >
                              {dominant.rarity}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>H1</td>
                          <td>{h1.name}</td>
                          <td>
                            <div
                              className={`trait-rarity rarity-${h1.rarity.toLowerCase()}`}
                            >
                              {h1.rarity}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>H2</td>
                          <td>{h2.name}</td>
                          <td>
                            <div
                              className={`trait-rarity rarity-${h2.rarity.toLowerCase()}`}
                            >
                              {h2.rarity}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>H3</td>
                          <td>{h3.name}</td>
                          <td>
                            <div
                              className={`trait-rarity rarity-${h3.rarity.toLowerCase()}`}
                            >
                              {h3.rarity}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <div className="set-breed-slime-button-container">
              <button
                className={`set-breed-slime-button ${canSetSlimeToBreed(selectedSlime) ? "set-breed-slime-active" : ""}`}
                onClick={() =>
                  setSlimeToBreed(selectedSlime)
                }
                disabled={!canSetSlimeToBreed(selectedSlime)}
              >
                Select for Breeding
              </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SlimeLabInventory;
