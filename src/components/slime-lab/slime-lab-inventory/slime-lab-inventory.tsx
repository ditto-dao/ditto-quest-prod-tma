import { useState } from "react";
import Modal from "react-modal";
import "./slime-lab-inventory.css";
import { SlimeWithTraits } from "../../../utils/types";
import BasicSlimeImg from "../../../assets/ditto-on-cloud.png";

interface SlimeLabInventoryProps {
  slimes: SlimeWithTraits[];
  equippedSlimeId?: number;
}

function SlimeLabInventory({
  slimes,
  equippedSlimeId,
}: SlimeLabInventoryProps) {
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

  return (
    <>
      <div id="slime-lab-inventory-container" className="inventory-grid">
        {slimes.map((slime) => (
          <div
            key={slime.id}
            className={`slime-inventory-item ${
              slime.id === equippedSlimeId ? "equipped-slime" : ""
            }`}
            onClick={() => openModal(slime)}
          >
            <div className="slime-name">{`Slime #${slime.id}`}</div>
          </div>
        ))}
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
                className="slime-image"
              />
            </div>

            {/* Slime ID and Rarity */}
            <div className="slime-info-row">
              <div className="slime-info-id">{`Slime #${selectedSlime.id}`}</div>
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
                  <p>{trait}</p>
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
                        <td>{dominant.rarity}</td>
                      </tr>
                      <tr>
                        <td>H1</td>
                        <td>{h1.name}</td>
                        <td>{h1.rarity}</td>
                      </tr>
                      <tr>
                        <td>H2</td>
                        <td>{h2.name}</td>
                        <td>{h2.rarity}</td>
                      </tr>
                      <tr>
                        <td>H3</td>
                        <td>{h3.name}</td>
                        <td>{h3.rarity}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default SlimeLabInventory;
