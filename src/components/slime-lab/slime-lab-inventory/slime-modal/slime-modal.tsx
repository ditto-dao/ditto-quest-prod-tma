import Separator from "../../../../assets/images/general/separator.svg";
import "./slime-modal.css";
import { SlimeWithTraits } from "../../../../utils/types";
import { getHighestDominantTraitRarity } from "../../../../utils/helpers";
import { useUserSocket } from "../../../../redux/socket/user/user-context";
import { useIdleSkillSocket } from "../../../../redux/socket/idle/skill-context";

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
  if (!selectedSlime) return null;

  return (
    <div className="slime-modal-content">
      {/* Slime Image */}
      <div className="slime-image-container">
        <div
          className="slime-rank-display"
          style={{
            color: `var(--rarity-${getHighestDominantTraitRarity(
              selectedSlime
            ).toLowerCase()})`,
          }}
        >
          {getHighestDominantTraitRarity(selectedSlime)}
        </div>
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
