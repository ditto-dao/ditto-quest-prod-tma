import { useUserSocket } from "../../redux/socket/user/user-context";
import "./item-eq-modal.css";
import EquipmentIcon from "../../assets/images/general/equipment-icon.png";
import ItemIcon from "../../assets/images/general/item-icon.png";
import { EquipmentType, Inventory } from "../../utils/types";
import { useNotification } from "../notifications/notification-context";
import SellNotification from "../sell-modal/sell-modal";

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
  removeNotification,
}: ItemEqModalProps) {
  const { userData, equip, unequip } = useUserSocket();
  const { addNotification } = useNotification();

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

  const canSell = () => {
    if (selectedItem.item && selectedItem.itemId) return true;
    if (!isEquipped()) return true;
    if (isEquipped() && selectedItem.quantity > 1) return true;
    return false;
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
                    selectedItem.equipment!.requiredLvlCombat > userData.level
                      ? "red"
                      : ""
                  }`}
                >
                  Req. Lvl. {selectedItem.equipment!.requiredLvlCombat}
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
            disabled={!meetsLvlReq(selectedItem.equipment.requiredLvlCombat)}
          >
            {!meetsLvlReq(selectedItem.equipment.requiredLvlCombat)
              ? `Requires Lvl ${selectedItem.equipment.requiredLvlCombat}`
              : isEquipped()
              ? "Unequip"
              : "Equip"}
          </button>
        )}
        <button
          className={`sell-button ${canSell() ? "sell-active" : ""}`}
          onClick={() => {
            addNotification((id) => (
              <SellNotification
                notificationId={id}
                parentNotificationId={notificationId}
                removeNotification={removeNotification}
                selectedItem={selectedItem}
                isEquipped={isEquipped()}
              />
            ));
          }}
          disabled={!canSell()}
        >
          Sell
        </button>
      </div>
    </div>
  );
}
