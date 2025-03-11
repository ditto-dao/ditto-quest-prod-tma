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
import DefaultSkillbook from "../../assets/images/avatar-page/default-skillbook.png";
import EquipmentIcon from "../../assets/images/general/equipment-icon.png";
import Modal from "react-modal";
import { useState } from "react";
import { Equipment, EquipmentType } from "../../utils/types";

function AvatarPage() {
  const { userData, unequip } = useUserSocket();

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [isEquiomentModalOpen, setIsEquipmentModalOpen] = useState(false);

  // Equipment Modal
  const handleEquipmentOpenModal = (equipment: Equipment) => {
    if (!isEquiomentModalOpen) {
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

      <div id="spellbook-slot-wrapper">
        <div id="spellbook-slot-container">
          <div className="spellbook-slot-label">Skillbooks</div>

          <div className="avatar-row">
            <div className="spellbook-slot">
                <img
                  className="slot-image-default"
                  src={DefaultSkillbook}
                ></img>
            </div>
            <div className="spellbook-slot">

                <img
                  className="slot-image-default"
                  src={DefaultSkillbook}
                ></img>
            </div>
            <div className="spellbook-slot">
                <img
                  className="slot-image-default"
                  src={DefaultSkillbook}
                ></img>
            </div>
          </div>
        </div>
      </div>
      {/* Render the equipment modal */}
      <Modal
        isOpen={isEquiomentModalOpen}
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
                      {selectedEquipment.description}
                    </div>
                  </div>
                </div>
                <div className="inv-buttons-div">
                  <button
                    className={"equip-button equip-active"}
                    onClick={() => {handleUnequip(selectedEquipment.type)}}
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
