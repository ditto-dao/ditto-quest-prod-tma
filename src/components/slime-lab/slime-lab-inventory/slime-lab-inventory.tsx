import { useState } from "react";
import Modal from "react-modal";
import "./slime-lab-inventory.css";
import { SlimeWithTraits } from "../../../utils/types";
import Separator from "../../../assets/images/general/separator.svg";
import { getHighestDominantTraitRarity } from "../../../utils/helpers";
import { useIdleSkillSocket } from "../../../redux/socket/idle/skill-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";

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
  const { userData } = useUserSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlime, setSelectedSlime] = useState<SlimeWithTraits | null>(
    null
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const openModal = (slime: SlimeWithTraits) => {
    setSelectedSlime(slime);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSlime(null);
    setIsModalOpen(false);
    setExpanded({});
  };

  const canSetSlimeToBreed = (slime: SlimeWithTraits) => {
    return (
      slime.id !== userData.equippedSlime?.id &&
      !breedingStatus &&
      slime.id !== slimeToBreed0?.id &&
      slime.id !== slimeToBreed1?.id
    );
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
            : // Render a single row of empty slots when inventory is empty
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="slime-inventory-item empty"
                ></div>
              ))}
          {/* Add an empty box if the number of slimes is odd */}
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
          <div className="slime-modal-content">
            <button onClick={closeModal} className="close-modal-button">
              X
            </button>
            {/* Slime Image */}
            <div className="slime-image-container">
              <img
                src={selectedSlime.imageUri}
                alt={`#${selectedSlime.id}`}
                className={`slime-image rarity-${getHighestDominantTraitRarity(
                  selectedSlime
                ).toLowerCase()}`}
              />
            </div>

            {/* Slime ID and Rarity */}
            <div className="slime-info-row">
              <div className="slime-info-id">{`Slime ${selectedSlime.id}`}</div>
              <img src={Separator}></img>
              <div className="slime-info-gen">
                Gen {selectedSlime.generation}
              </div>
            </div>

            {/* Slime Traits */}
            <div className="slime-traits">
              {[
                {
                  trait: "Body",
                  dominant: selectedSlime.BodyDominant,
                  h1: selectedSlime.BodyHidden1,
                  h2: selectedSlime.BodyHidden2,
                  h3: selectedSlime.BodyHidden3,
                },
                {
                  trait: "Pattern",
                  dominant: selectedSlime.PatternDominant,
                  h1: selectedSlime.PatternHidden1,
                  h2: selectedSlime.PatternHidden2,
                  h3: selectedSlime.PatternHidden3,
                },
                {
                  trait: "PrimaryColour",
                  dominant: selectedSlime.PrimaryColourDominant,
                  h1: selectedSlime.PrimaryColourHidden1,
                  h2: selectedSlime.PrimaryColourHidden2,
                  h3: selectedSlime.PrimaryColourHidden3,
                },
                {
                  trait: "Accent",
                  dominant: selectedSlime.AccentDominant,
                  h1: selectedSlime.AccentHidden1,
                  h2: selectedSlime.AccentHidden2,
                  h3: selectedSlime.AccentHidden3,
                },
                {
                  trait: "Detail",
                  dominant: selectedSlime.DetailDominant,
                  h1: selectedSlime.DetailHidden1,
                  h2: selectedSlime.DetailHidden2,
                  h3: selectedSlime.DetailHidden3,
                },
                {
                  trait: "EyeColour",
                  dominant: selectedSlime.EyeColourDominant,
                  h1: selectedSlime.EyeColourHidden1,
                  h2: selectedSlime.EyeColourHidden2,
                  h3: selectedSlime.EyeColourHidden3,
                },
                {
                  trait: "EyeShape",
                  dominant: selectedSlime.EyeShapeDominant,
                  h1: selectedSlime.EyeShapeHidden1,
                  h2: selectedSlime.EyeShapeHidden2,
                  h3: selectedSlime.EyeShapeHidden3,
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
                    {/* Add a button to toggle the expanded state */}
                    <div
                      className="trait-table-label"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [trait]: !prev[trait],
                        }))
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {trait} {expanded[trait] ? "▲" : "▼"}
                    </div>
                    <table className="trait-table">
                      <thead>
                        <tr>
                          <th>Gene</th>
                          <th>Name</th>
                          <th>Rarity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Show only the first row when collapsed, or all rows when expanded */}
                        {(expanded[trait]
                          ? [dominant, h1, h2, h3]
                          : [dominant]
                        ).map((row, index) => (
                          <tr key={index}>
                            <td>{index === 0 ? "D" : `H${index}`}</td>
                            <td>{row.name}</td>
                            <td>
                              <div
                                className={`trait-rarity rarity-${row.rarity.toLowerCase()}`}
                              >
                                {row.rarity}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <div className="set-breed-slime-button-container">
                <button
                  className={`set-breed-slime-button ${
                    canSetSlimeToBreed(selectedSlime)
                      ? "set-breed-slime-active"
                      : ""
                  }`}
                  onClick={() => setSlimeToBreed(selectedSlime)}
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
