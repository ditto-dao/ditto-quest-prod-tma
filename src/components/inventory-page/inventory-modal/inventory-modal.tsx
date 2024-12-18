import Modal from "react-modal";
import "./inventory-modal.css";
import EquipmentIcon from "../../../assets/images/general/equipment-icon.png";
import ItemIcon from "../../../assets/images/general/item-icon.png";
import { Inventory } from "../../../utils/types";
import { useUserSocket } from "../../../redux/socket/user/user-context";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Inventory | null;
}

function InventoryModal({ isOpen, onClose, item }: InventoryModalProps) {
  if (!item) return null; // Don't render the modal if no item is selected

  const { userData, equip } = useUserSocket();
  const isEquipped = !!(
    userData &&
    item?.equipment &&
    item.equipmentId &&
    userData[item.equipment.type]?.equipmentId === item.equipmentId
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Inventory Item Details"
      className="inventory-item-modal"
      overlayClassName="inventory-item-modal-overlay"
    >
      <div className="modal-border-container">
        <div className="modal-content">
          <button onClick={onClose} className="close-inventory-modal-button">
            X
          </button>
          <div className="item-details">
            <div className="item-header">
              {item.itemId ? (
                <img src={ItemIcon} alt="Item icon" className="item-icon" />
              ) : (
                <img
                  src={EquipmentIcon}
                  alt="Equipment icon"
                  className="equipment-icon"
                />
              )}
              <div className="inv-modal-header-name">
                {item.item?.name || item.equipment?.name}
              </div>
            </div>
            <div className="item-content">
              <div className="item-image-container">
                <div
                  className={`rarity-badge rarity-${
                    item.item?.rarity.toLowerCase() ||
                    item.equipment?.rarity.toLowerCase()
                  }`}
                >
                  {item.item?.rarity || item.equipment?.rarity}
                </div>
                <img
                  src={item.item?.imgsrc || item.equipment?.imgsrc}
                  alt={item.item?.name || item.equipment?.name}
                  className="item-image"
                />
              </div>

              <div className="inv-modal-item-description-container">
                {item.item?.description || item.equipment?.description}
              </div>
            </div>
          </div>
          <div className="inv-buttons-div">
            {item.equipment && item.equipmentId && (
              <button
                className={`equip-button ${isEquipped ? "equip-active" : ""}`}
                onClick={() => equip(item.id, item.equipment!.type)}
                disabled={isEquipped} // Disable the button if it's already equipped
              >
                {isEquipped ? "Equipped" : "Equip"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default InventoryModal;
