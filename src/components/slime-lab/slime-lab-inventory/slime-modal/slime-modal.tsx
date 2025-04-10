import Separator from "../../../../assets/images/general/separator.svg";
import "./slime-modal.css";
import { SlimeWithTraits } from "../../../../utils/types";
import { getHighestDominantTraitRarity } from "../../../../utils/helpers";

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
  onRequestClose: () => void;
  selectedSlime: SlimeWithTraits | null;
  isSlimeEquipped: (slimeId: number) => boolean;
  canSetSlimeToBreed: (slime: SlimeWithTraits) => boolean;
  equipSlime: (slime: SlimeWithTraits) => void;
  unequipSlime: () => void;
  setSlimeToBreed: (slime: SlimeWithTraits) => void;
}

export default function SlimeModal({
  onRequestClose,
  selectedSlime,
  isSlimeEquipped,
  canSetSlimeToBreed,
  equipSlime,
  unequipSlime,
  setSlimeToBreed,
}: SlimeModalProps) {
  if (!selectedSlime) return null;

  return (
    <div className="slime-modal-content">
      <button onClick={onRequestClose} className="close-modal-button">
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
        <img src={Separator} alt="separator" />
        <div className="slime-info-gen">Gen {selectedSlime.generation}</div>
      </div>

      {/* Equip Button */}
      <div className="equip-slime-button-container">
        {isSlimeEquipped(selectedSlime.id) ? (
          <button
            className="equip-slime-button equip-slime-active"
            onClick={() => unequipSlime()}
          >
            Unequip Slime
          </button>
        ) : (
          <button
            className="equip-slime-button"
            onClick={() => equipSlime(selectedSlime)}
          >
            Equip Slime
          </button>
        )}
      </div>

      {/* Set for Breeding */}
      <div className="set-breed-slime-button-container">
        <button
          className={`set-breed-slime-button ${
            canSetSlimeToBreed(selectedSlime) ? "set-breed-slime-active" : ""
          }`}
          onClick={() => setSlimeToBreed(selectedSlime)}
          disabled={!canSetSlimeToBreed(selectedSlime)}
        >
          Select for Breeding
        </button>
      </div>

      {/* Traits Table */}
      <div className="slime-traits">
        {TRAIT_KEYS.map((trait) => {
          const dominant =
            selectedSlime[`${trait}Dominant` as keyof SlimeWithTraits];
          const h1 = selectedSlime[`${trait}Hidden1` as keyof SlimeWithTraits];
          const h2 = selectedSlime[`${trait}Hidden2` as keyof SlimeWithTraits];
          const h3 = selectedSlime[`${trait}Hidden3` as keyof SlimeWithTraits];

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
                      <tr key={index}>
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
    </div>
  );
}
