import "./avatar-page.css";
import "../inventory-page/inventory-page.css";
import { useUserSocket } from "../../redux/socket/user/user-context";
import DefaultHat from "../../assets/images/avatar-page/default-hat.png";
import DefaultCape from "../../assets/images/avatar-page/default-cape.png";
import DefaultWeapon from "../../assets/images/avatar-page/default-sword.png";
import DefaultShield from "../../assets/images/avatar-page/default-shield.png";
import DefaultNecklace from "../../assets/images/avatar-page/default-necklace.png";
import DefaultArmour from "../../assets/images/avatar-page/default-armour.png";
import DefaultPet from "../../assets/images/avatar-page/default-pet.png";
import SlimeLogo from "../../assets/images/general/dq-logo.png";
import CPIcon from "../../assets/images/combat/cp-logo.png";
import GoldMedalIcon from "../../assets/images/combat/gold-medal.png";
import HPLevelIcon from "../../assets/images/combat/hp-lvl.png";
import { defaultCombat, Inventory } from "../../utils/types";
import {
  formatDecimalWithCommas,
  formatDecimalWithSuffix,
  formatNumberWithCommas,
  getHighestDominantTraitRarity,
} from "../../utils/helpers";
import FastImage from "../../components/fast-image/fast-image";
import SlimeModal from "../slime-lab/slime-lab-inventory/slime-modal/slime-modal";
import { useNotification } from "../notifications/notification-context";
import ItemEqModal from "../item-eq-modal/item-eq-modal";
import Decimal from "decimal.js";

function AvatarPage() {
  const { addNotification, removeNotification } = useNotification();
  const { userData } = useUserSocket();

  const cp = new Decimal(userData.combat?.cp || defaultCombat.cp);

  // Slime Modal
  const openSlimeModal = () => {
    if (userData.equippedSlime) {
      addNotification((id) => (
        <SlimeModal
          notificationId={id}
          removeNotification={removeNotification}
          closeOnEquip={true}
          closeOnUnequip={true}
          selectedSlime={userData.equippedSlime}
        />
      ));
    }
  };

  // Equipment Modal
  const handleEquipmentOpenModal = (equipmentInv: Inventory) => {
    addNotification((id) => (
      <ItemEqModal
        notificationId={id}
        selectedItem={equipmentInv}
        closeOnUnequip={true}
        removeNotification={removeNotification}
      />
    ));
  };

  return (
    <div id="avatar-page-container">
      <div id="slime-slot-wrapper">
        <div id="slime-slot-container">
          <div className="slime-slot-label">Avatar</div>
          <div className="equipped-slime-content">
            <div className="equipped-slime-image-container">
              {userData.equippedSlime ? (
                <div className="equipped-slime-avatar">
                  <div
                    className="slime-rank-display"
                    style={{
                      color: `var(--rarity-${getHighestDominantTraitRarity(
                        userData.equippedSlime
                      ).toLowerCase()})`,
                    }}
                  >
                    {getHighestDominantTraitRarity(userData.equippedSlime)}
                  </div>
                  <FastImage
                    src={userData.equippedSlime.imageUri}
                    alt="Equipped Slime"
                    fallback={SlimeLogo}
                    onClick={() => openSlimeModal()}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              ) : (
                <div className="equipped-slime-avatar empty">
                  <FastImage src={SlimeLogo} alt="Default Slime" />
                </div>
              )}
            </div>
            <div className="equipped-slime-stats-summary">
              {/* LVL */}
              <div className="stats-summary-field-with-progress">
                <div className="stats-summary-field">
                  <div className="stats-summary-label">
                    <FastImage src={GoldMedalIcon} alt="Level Icon" />
                    <div>LVL</div>
                  </div>
                  <div>{formatNumberWithCommas(userData.level)}</div>
                </div>
                <div className="stats-summary-progress-bar">
                  <div
                    className="stats-summary-progress-fill"
                    style={{
                      width: `${
                        (userData.exp / userData.expToNextLevel) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* HP LVL */}
              <div className="stats-summary-field-with-progress">
                <div className="stats-summary-field">
                  <div className="stats-summary-label">
                    <FastImage src={HPLevelIcon} alt="HP Level Icon" />
                    <div>HPLVL</div>
                  </div>
                  <div>{formatNumberWithCommas(userData.hpLevel)}</div>
                </div>
                <div className="stats-summary-progress-bar">
                  <div
                    className="stats-summary-progress-fill"
                    style={{
                      width: `${
                        (userData.expHp / userData.expToNextHpLevel) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* CP (no progress bar) */}
              <div className="stats-summary-field-no-progress">
                <div className="stats-summary-field">
                  <div className="stats-summary-label">
                    <FastImage src={CPIcon} alt="Combat Power Icon" />
                    <div>CP</div>
                  </div>
                  <div>
                    {cp.lt(1_000_000)
                      ? formatDecimalWithCommas(cp)
                      : formatDecimalWithSuffix(cp)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="equipment-slot-wrapper">
        <div id="equipment-slot-container">
          <div className="equipment-slot-label">Equipment</div>
          {/* Row 1: Hat */}
          <div className="avatar-row">
            <div
              className="hat-slot"
              style={{
                border:
                  userData.hat && userData.hat.equipment
                    ? `1.5px solid var(--rarity-${userData.hat.equipment.rarity.toLowerCase()})`
                    : "1.5px solid var(--bright-teal)",
              }}
            >
              {userData.hat ? (
                <FastImage
                  className="slot-image"
                  src={userData.hat.equipment!.imgsrc}
                  alt="Hat"
                  fallback={DefaultHat}
                  onClick={() => handleEquipmentOpenModal(userData.hat!)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <FastImage
                  className="slot-image-default"
                  src={DefaultHat}
                  alt="Default Hat"
                />
              )}
            </div>
          </div>

          {/* Row 2: Cape, Necklace, Pet */}
          <div className="avatar-row">
            <div
              className="cape-slot"
              style={{
                border:
                  userData.cape && userData.cape.equipment
                    ? `1.5px solid var(--rarity-${userData.cape.equipment.rarity.toLowerCase()})`
                    : "1.5px solid var(--bright-teal)",
              }}
            >
              {userData.cape ? (
                <FastImage
                  className="slot-image"
                  src={userData.cape.equipment!.imgsrc}
                  alt="Cape"
                  fallback={DefaultCape}
                  onClick={() => handleEquipmentOpenModal(userData.cape!)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <FastImage
                  className="slot-image-default"
                  src={DefaultCape}
                  alt="Default Cape"
                />
              )}
            </div>
            <div
              className="necklace-slot"
              style={{
                border:
                  userData.necklace && userData.necklace.equipment
                    ? `1.5px solid var(--rarity-${userData.necklace.equipment.rarity.toLowerCase()})`
                    : "1.5px solid var(--bright-teal)",
              }}
            >
              {userData.necklace ? (
                <FastImage
                  className="slot-image"
                  src={userData.necklace.equipment!.imgsrc}
                  alt="Necklace"
                  fallback={DefaultNecklace}
                  onClick={() => handleEquipmentOpenModal(userData.necklace!)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <FastImage
                  className="slot-image-default"
                  src={DefaultNecklace}
                  alt="Default Necklace"
                />
              )}
            </div>
            <div className="pet-slot">
              <FastImage
                className="slot-image-default"
                src={DefaultPet}
                alt="Default Pet"
              />
            </div>
          </div>

          {/* Row 3: Shield, Armour, Weapon */}
          <div className="avatar-row">
            <div
              className="shield-slot"
              style={{
                border:
                  userData.shield && userData.shield.equipment
                    ? `1.5px solid var(--rarity-${userData.shield.equipment.rarity.toLowerCase()})`
                    : "1.5px solid var(--bright-teal)",
              }}
            >
              {userData.shield ? (
                <FastImage
                  className="slot-image"
                  src={userData.shield.equipment!.imgsrc}
                  alt="Shield"
                  fallback={DefaultShield}
                  onClick={() => handleEquipmentOpenModal(userData.shield!)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <FastImage
                  className="slot-image-default"
                  src={DefaultShield}
                  alt="Default Shield"
                />
              )}
            </div>
            <div
              className="armour-slot"
              style={{
                border:
                  userData.armour && userData.armour.equipment
                    ? `1.5px solid var(--rarity-${userData.armour.equipment.rarity.toLowerCase()})`
                    : "1.5px solid var(--bright-teal)",
              }}
            >
              {userData.armour ? (
                <FastImage
                  className="slot-image"
                  src={userData.armour.equipment!.imgsrc}
                  alt="Armour"
                  fallback={DefaultArmour}
                  onClick={() => handleEquipmentOpenModal(userData.armour!)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <FastImage
                  className="slot-image-default"
                  src={DefaultArmour}
                  alt="Default Armour"
                />
              )}
            </div>
            <div
              className="weapon-slot"
              style={{
                border:
                  userData.weapon && userData.weapon.equipment
                    ? `1.5px solid var(--rarity-${userData.weapon.equipment.rarity.toLowerCase()})`
                    : "1.5px solid var(--bright-teal)",
              }}
            >
              {userData.weapon ? (
                <FastImage
                  className="slot-image"
                  src={userData.weapon.equipment!.imgsrc}
                  alt="Weapon"
                  fallback={DefaultWeapon}
                  onClick={() => handleEquipmentOpenModal(userData.weapon!)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <FastImage
                  className="slot-image-default"
                  src={DefaultWeapon}
                  alt="Default Weapon"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/*       <div id="spellbook-slot-wrapper">
        <div id="spellbook-slot-container">
          <div className="spellbook-slot-label">Skillbooks</div>

          <div className="avatar-row">
            <div className="spellbook-slot">
              <FastImage className="slot-image-default" src={DefaultSkillbook} alt="Default Skillbook" />
            </div>
            <div className="spellbook-slot">
              <FastImage className="slot-image-default" src={DefaultSkillbook} alt="Default Skillbook" />
            </div>
            <div className="spellbook-slot">
              <FastImage className="slot-image-default" src={DefaultSkillbook} alt="Default Skillbook" />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default AvatarPage;
