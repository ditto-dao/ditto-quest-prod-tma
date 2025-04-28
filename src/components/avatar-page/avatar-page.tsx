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
import SlimeLogo from "../../assets/images/general/slime-mage.png";
//import DefaultSkillbook from "../../assets/images/avatar-page/default-skillbook.png";
import CPIcon from "../../assets/images/combat/cp-logo.png";
import GoldMedalIcon from "../../assets/images/combat/gold-medal.png";
import HPLevelIcon from "../../assets/images/combat/hp-lvl.png";
import {
  defaultCombat,
  Inventory,
} from "../../utils/types";
import {
  calculateCombatPower,
  formatDecimalWithCommas,
  formatDecimalWithSuffix,
  formatNumberWithCommas,
} from "../../utils/helpers";
import SlimeModal from "../slime-lab/slime-lab-inventory/slime-modal/slime-modal";
import { useNotification } from "../notifications/notification-context";
import ItemEqModal from "../item-eq-modal/item-eq-modal";

function AvatarPage() {
  const { addNotification, removeNotification } = useNotification();
  const { userData } = useUserSocket();

  const cp = calculateCombatPower(userData.combat || defaultCombat);

  // Slime Modal
  const openSlimeModal = () => {
    if (userData.equippedSlime) {
      addNotification((id) => (
        <SlimeModal
          notificationId={id}
          removeNotification={removeNotification}
          selectedSlime={userData.equippedSlime}
        />
      ));
    }
  };

  // Equipment Modal
  const handleEquipmentOpenModal = (equipmentInv: Inventory) => {
    addNotification(() => <ItemEqModal selectedItem={equipmentInv} />);

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
                  <img
                    src={userData.equippedSlime.imageUri}
                    alt="Equipped Slime"
                    onClick={() => openSlimeModal()}
                  />
                </div>
              ) : (
                <div className="equipped-slime-avatar empty">
                  <img src={SlimeLogo}></img>
                </div>
              )}
            </div>
            <div className="equipped-slime-stats-summary">
              {/* LVL */}
              <div className="stats-summary-field-with-progress">
                <div className="stats-summary-field">
                  <div className="stats-summary-label">
                    <img src={GoldMedalIcon} />
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
                    <img src={HPLevelIcon} />
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
                    <img src={CPIcon} />
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
            <div className="hat-slot">
              {userData.hat ? (
                <img
                  className="slot-image"
                  src={userData.hat.equipment!.imgsrc}
                  onClick={() =>
                    handleEquipmentOpenModal(userData.hat!)
                  }
                ></img>
              ) : (
                <img className="slot-image-default" src={DefaultHat}></img>
              )}
            </div>
          </div>

          {/* Row 2: Cape, Necklace, Pet */}
          <div className="avatar-row">
            <div className="cape-slot">
              {userData.cape ? (
                <img
                  className="slot-image"
                  src={userData.cape.equipment!.imgsrc}
                  onClick={() =>
                    handleEquipmentOpenModal(userData.cape!)
                  }
                ></img>
              ) : (
                <img className="slot-image-default" src={DefaultCape}></img>
              )}
            </div>
            <div className="necklace-slot">
              {userData.necklace ? (
                <img
                  className="slot-image"
                  src={userData.necklace.equipment!.imgsrc}
                  onClick={() =>
                    handleEquipmentOpenModal(userData.necklace!)
                  }
                ></img>
              ) : (
                <img className="slot-image-default" src={DefaultNecklace}></img>
              )}
            </div>
            <div className="pet-slot">
              <img className="slot-image-default" src={DefaultPet}></img>
            </div>
          </div>

          {/* Row 3: Shield, Armour, Weapon */}
          <div className="avatar-row">
            <div className="shield-slot">
              {userData.shield ? (
                <img
                  className="slot-image"
                  src={userData.shield.equipment!.imgsrc}
                  onClick={() =>
                    handleEquipmentOpenModal(userData.shield!)
                  }
                ></img>
              ) : (
                <img className="slot-image-default" src={DefaultShield}></img>
              )}
            </div>
            <div className="armour-slot">
              {userData.armour ? (
                <img
                  className="slot-image"
                  src={userData.armour.equipment!.imgsrc}
                  onClick={() =>
                    handleEquipmentOpenModal(userData.armour!)
                  }
                ></img>
              ) : (
                <img className="slot-image-default" src={DefaultArmour}></img>
              )}
            </div>
            <div className="weapon-slot">
              {userData.weapon ? (
                <img
                  className="slot-image"
                  src={userData.weapon.equipment!.imgsrc}
                  onClick={() =>
                    handleEquipmentOpenModal(userData.weapon!)
                  }
                ></img>
              ) : (
                <img className="slot-image-default" src={DefaultWeapon}></img>
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
              <img className="slot-image-default" src={DefaultSkillbook}></img>
            </div>
            <div className="spellbook-slot">
              <img className="slot-image-default" src={DefaultSkillbook}></img>
            </div>
            <div className="spellbook-slot">
              <img className="slot-image-default" src={DefaultSkillbook}></img>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default AvatarPage;
