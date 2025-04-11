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
import EquipmentIcon from "../../assets/images/general/equipment-icon.png";
import CPIcon from "../../assets/images/combat/cp-logo.png";
import GoldMedalIcon from "../../assets/images/combat/gold-medal.png";
import HPLevelIcon from "../../assets/images/combat/hp-lvl.png";
import Modal from "react-modal";
import { useState } from "react";
import {
  defaultCombat,
  Equipment,
  EquipmentType,
  SlimeWithTraits,
} from "../../utils/types";
import {
  calculateCombatPower,
  formatNumberWithCommas,
  formatNumberWithSuffix,
} from "../../utils/helpers";
import SlimeModal from "../slime-lab/slime-lab-inventory/slime-modal/slime-modal";
import { useIdleSkillSocket } from "../../redux/socket/idle/skill-context";

function AvatarPage() {
  const { userData, unequip, equipSlime, unequipSlime } = useUserSocket();
  const { setSlimeToBreed, breedingStatus, slimeToBreed0, slimeToBreed1 } =
    useIdleSkillSocket();
  const [isSlimeModalOpen, setIsSlimeModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);

  // Slime Modal
  const openSlimeModal = () => {
    setIsSlimeModalOpen(true);
  };

  const closeSlimeModal = () => {
    setIsSlimeModalOpen(false);
  };

  const unequipSlimeFromAvatarPage = () => {
    closeSlimeModal();
    unequipSlime();
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

  // Equipment Modal
  const handleEquipmentOpenModal = (equipment: Equipment) => {
    if (!isEquipmentModalOpen) {
      setSelectedEquipment(equipment);
      setIsEquipmentModalOpen(true);
    }
  };

  const handleCloseEquipmentModal = () => {
    setSelectedEquipment(null);
    setIsEquipmentModalOpen(false);
  };

  const handleUnequip = (equipmentType: EquipmentType) => {
    setSelectedEquipment(null);
    setIsEquipmentModalOpen(false);
    unequip(equipmentType);
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
                    {calculateCombatPower(userData.combat || defaultCombat) <
                    1000000
                      ? formatNumberWithCommas(
                          calculateCombatPower(userData.combat || defaultCombat)
                        )
                      : formatNumberWithSuffix(
                          calculateCombatPower(userData.combat || defaultCombat)
                        )}
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
                    handleEquipmentOpenModal(userData.hat!.equipment!)
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
                    handleEquipmentOpenModal(userData.cape!.equipment!)
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
                    handleEquipmentOpenModal(userData.necklace!.equipment!)
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
                    handleEquipmentOpenModal(userData.shield!.equipment!)
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
                    handleEquipmentOpenModal(userData.armour!.equipment!)
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
                    handleEquipmentOpenModal(userData.weapon!.equipment!)
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

      {/* Render the slime modal */}
      <Modal
        isOpen={isSlimeModalOpen}
        onRequestClose={closeSlimeModal}
        contentLabel="Slime Details"
        className="slime-modal"
        overlayClassName="slime-modal-overlay"
      >
        {userData.equippedSlime && (
          <SlimeModal
            selectedSlime={userData.equippedSlime}
            isSlimeEquipped={isSlimeEquipped}
            canSetSlimeToBreed={canSetSlimeToBreed}
            equipSlime={equipSlime}
            unequipSlime={unequipSlimeFromAvatarPage}
            setSlimeToBreed={setSlimeToBreed}
            onRequestClose={closeSlimeModal}
          />
        )}
      </Modal>

      {/* Render the equipment modal */}
      <Modal
        isOpen={isEquipmentModalOpen}
        onRequestClose={handleCloseEquipmentModal}
        contentLabel="Inventory Item Details"
        className="inventory-item-modal"
        overlayClassName="inventory-item-modal-overlay"
      >
        {selectedEquipment && (
          <div className="modal-content">
            <div className="modal-border-container">
              <div className="modal-content">
                <button
                  onClick={handleCloseEquipmentModal}
                  className="close-inventory-modal-button"
                >
                  X
                </button>
                <div className="item-details">
                  <div className="item-header">
                    <img
                      src={EquipmentIcon}
                      alt="Equipment icon"
                      className="equipment-icon"
                    />
                    <div className="inv-modal-header-name">
                      {selectedEquipment.name}
                    </div>
                  </div>
                  <div className="item-content">
                    <div className="item-image-container">
                      <div
                        className={`rarity-badge rarity-${selectedEquipment.rarity.toLowerCase()}`}
                      >
                        {selectedEquipment.rarity}
                      </div>
                      <img
                        src={selectedEquipment.imgsrc}
                        alt={selectedEquipment.name}
                        className="item-image"
                      />
                    </div>
                    <div className="inv-modal-item-description-container">
                      <div className="inv-eq-tab-info">
                        {selectedEquipment.attackType && (
                          <div
                            className={`attack-type ${
                              selectedEquipment.requiredLvl > userData.level
                                ? "red"
                                : ""
                            } ${
                              selectedEquipment.attackType === "Melee"
                                ? "melee"
                                : selectedEquipment.attackType === "Ranged"
                                ? "ranged"
                                : selectedEquipment.attackType === "Magic"
                                ? "magic"
                                : ""
                            }`}
                          >
                            {selectedEquipment.attackType}
                          </div>
                        )}
                        <div
                          className={`required-lvl ${
                            selectedEquipment.requiredLvl > userData.level
                              ? "red"
                              : ""
                          }`}
                        >
                          Req. Lvl. {selectedEquipment.requiredLvl}
                        </div>
                      </div>
                      <div>{selectedEquipment.description}</div>
                    </div>
                  </div>
                </div>
                <div className="inv-buttons-div">
                  <button
                    className={"equip-button equip-active"}
                    onClick={() => {
                      handleUnequip(selectedEquipment.type);
                    }}
                  >
                    Unequip
                  </button>
                </div>
              </div>
            </div>{" "}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AvatarPage;
