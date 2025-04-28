import { useUserSocket } from "../../redux/socket/user/user-context";
import "./item-eq-modal.css";
import EquipmentIcon from "../../assets/images/general/equipment-icon.png";
import ItemIcon from "../../assets/images/general/item-icon.png";
import { EquipmentType, Inventory } from "../../utils/types";

interface ItemEqModalProps {
  selectedItem: Inventory;
  notificationId: string;
  closeOnEquip?: boolean;
  closeOnUnequip?: boolean;
  removeNotification: (id: string) => void;
}

export default function ItemEqModal({ 
  selectedItem,
  notificationId,
  closeOnEquip,
  closeOnUnequip,
  removeNotification
}: ItemEqModalProps) {
  const { userData, equip, unequip } = useUserSocket();

  const meetsLvlReq = (reqLvl: number) => {
    return reqLvl <= userData.level;
  };

  const isEquipped = () => {
    return !!(
      userData &&
      selectedItem &&
      selectedItem.equipment &&
      selectedItem.equipmentId &&
      userData[selectedItem.equipment.type]?.equipmentId ===
        selectedItem.equipmentId
    );
  };

  const handleUnequip = (equipmentType: EquipmentType) => {
    unequip(equipmentType);
  };

  return (
    <div className="item-eq-content">
      <div className="item-image-wrapper">
        <div className="item-image-container">
          <div
            className={`rarity-badge rarity-${
              selectedItem.item?.rarity?.toLowerCase() ||
              selectedItem.equipment?.rarity?.toLowerCase()
            }`}
          >
            {selectedItem.item?.rarity || selectedItem.equipment?.rarity}
          </div>
          <img
            src={selectedItem.item?.imgsrc || selectedItem.equipment?.imgsrc}
            alt={selectedItem.item?.name || selectedItem.equipment?.name}
            className="item-image"
          />
        </div>
      </div>
      <div className="item-details">
        <div className="item-content">
          <div className="inv-modal-item-description-container">
            <div className="item-header">
              {selectedItem.itemId ? (
                <img src={ItemIcon} alt="Item icon" className="item-icon" />
              ) : (
                <img
                  src={EquipmentIcon}
                  alt="Equipment icon"
                  className="equipment-icon"
                />
              )}
              <div className="inv-modal-header-name">
                {selectedItem.item?.name || selectedItem.equipment?.name}
              </div>
            </div>

            {selectedItem.equipmentId && (
              <div className="inv-eq-tab-info">
                {selectedItem.equipment?.attackType && (
                  <div
                    className={`attack-type ${
                      selectedItem.equipment.requiredLvl > userData.level
                        ? "red"
                        : ""
                    } ${
                      selectedItem.equipment.attackType === "Melee"
                        ? "melee"
                        : selectedItem.equipment.attackType === "Ranged"
                        ? "ranged"
                        : selectedItem.equipment.attackType === "Magic"
                        ? "magic"
                        : ""
                    }`}
                  >
                    {selectedItem.equipment.attackType}
                  </div>
                )}
                <div
                  className={`required-lvl ${
                    selectedItem.equipment!.requiredLvl > userData.level
                      ? "red"
                      : ""
                  }`}
                >
                  Req. Lvl. {selectedItem.equipment!.requiredLvl}
                </div>
              </div>
            )}
            <div className="description-text">
              {selectedItem.item?.description ||
                selectedItem.equipment?.description}
            </div>
          </div>
        </div>
      </div>

      <div className="inv-buttons-div">
        {selectedItem.equipment && selectedItem.equipmentId && (
          <button
            className={`equip-button ${isEquipped() ? "equip-active" : ""}`}
            onClick={() => {
              if (isEquipped() && selectedItem.equipment) {
                handleUnequip(selectedItem.equipment.type);
                if (closeOnUnequip) removeNotification(notificationId);
              } else {
                equip(selectedItem.id, selectedItem.equipment!.type);
                if (closeOnEquip) removeNotification(notificationId);
              }
            }}
            disabled={!meetsLvlReq(selectedItem.equipment.requiredLvl)}
          >
            {!meetsLvlReq(selectedItem.equipment.requiredLvl)
              ? `Requires Lvl ${selectedItem.equipment.requiredLvl}`
              : isEquipped()
              ? "Unequip"
              : "Equip"}
          </button>
        )}
      </div>
    </div>
  );
}
