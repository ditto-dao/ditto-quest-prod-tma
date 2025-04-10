import { useState, useEffect } from "react";
import "./inventory-page.css";
import { useUserSocket } from "../../redux/socket/user/user-context";
import DittoCoinLogo from "../../assets/images/general/ditto-coin.png";
import GoldCoinLogo from "../../assets/images/general/gold-coin.png";
import {
  formatNumberForInvQty,
  formatNumberWithSuffix,
  getTotalFormattedBalance,
} from "../../utils/helpers";
import EquipmentIcon from "../../assets/images/general/equipment-icon.png";
import ItemIcon from "../../assets/images/general/item-icon.png";
import { Inventory } from "../../utils/types";
import Modal from "react-modal";

// Helper function to chunk inventory into rows
function chunkInventory(array: Inventory[], size: number) {
  const chunks: (Inventory | null)[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  // Add empty slots for incomplete rows
  const lastChunk = chunks[chunks.length - 1];
  if (lastChunk && lastChunk.length < size) {
    const emptySlots = Array(size - lastChunk.length).fill(null);
    chunks[chunks.length - 1] = [...lastChunk, ...emptySlots];
  }

  return chunks;
}

function InventoryPage() {
  const { userData, equip, dittoBalance } = useUserSocket();
  const [inventory, setInventory] = useState<Inventory[]>([]);

  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      setInventory(userData.inventory);
    }
  }, [userData]);

  // Chunk inventory into rows of 4
  const inventoryRows = chunkInventory(inventory, 4);

  // Modal
  const handleOpenModal = (item: Inventory) => {
    if (!isModalOpen) {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

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

  return (
    <div id="inventory-page-container">
      <div className="inventory-page-content-wrapper">
        <div className="inventory-page-content-container">
          <div className="inv-container-label">Bank</div>
          <div className="balances-container">
            <div className="coin-balance">
              <img src={DittoCoinLogo} alt="Ditto Coin" className="coin-logo" />
              <span>
                {formatNumberWithSuffix(getTotalFormattedBalance(dittoBalance))}{" "}
                DITTO
              </span>
            </div>
            <div className="coin-balance">
              <img src={GoldCoinLogo} alt="Gold Coin" className="coin-logo" />
              <span>{formatNumberWithSuffix(userData.goldBalance)} GP</span>
            </div>
          </div>
        </div>
      </div>
      <div className="inventory-page-content-wrapper">
        <div className="inventory-page-content-container">
          <div className="inv-container-label">Inventory</div>
          {inventory.length === 0 ? (
            <div className="inventory-rows-wrapper">
              {/* Render a single row with 4 empty slots */}
              <div className="inventory-row">
                {Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="inventory-item empty"
                    ></div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="inventory-rows-wrapper">
              {inventoryRows.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="inventory-row">
                  {row.map((entry, colIndex) =>
                    entry ? (
                      <div
                        key={`entry-${entry.id}`}
                        onClick={() => handleOpenModal(entry)} // Open modal on click
                        className="inventory-item"
                      >
                        <img
                          src={entry.equipment?.imgsrc || entry.item?.imgsrc}
                          alt={entry.equipment?.name || entry.item?.name}
                          className="inv-item-image"
                        />
                        <div className="inv-item-quantity">
                          {formatNumberForInvQty(entry.quantity)}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={`empty-${rowIndex}-${colIndex}`} // Unique key for empty slots
                        className="inventory-item empty"
                      ></div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Render the modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Inventory Item Details"
        className="inventory-item-modal"
        overlayClassName="inventory-item-modal-overlay"
      >
        {selectedItem && (
          <div className="modal-content">
            <div className="modal-border-container">
              <div className="modal-content">
                <button
                  onClick={handleCloseModal}
                  className="close-inventory-modal-button"
                >
                  X
                </button>
                <div className="item-details">
                  <div className="item-header">
                    {selectedItem.itemId ? (
                      <img
                        src={ItemIcon}
                        alt="Item icon"
                        className="item-icon"
                      />
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
                  <div className="item-content">
                    <div className="item-image-container">
                      <div
                        className={`rarity-badge rarity-${
                          selectedItem.item?.rarity?.toLowerCase() ||
                          selectedItem.equipment?.rarity?.toLowerCase()
                        }`}
                      >
                        {selectedItem.item?.rarity ||
                          selectedItem.equipment?.rarity}
                      </div>
                      <img
                        src={
                          selectedItem.item?.imgsrc ||
                          selectedItem.equipment?.imgsrc
                        }
                        alt={
                          selectedItem.item?.name ||
                          selectedItem.equipment?.name
                        }
                        className="item-image"
                      />
                    </div>
                    <div className="inv-modal-item-description-container">
                      {selectedItem.equipmentId && (
                        <div className="inv-eq-tab-info">
                          {selectedItem.equipment?.attackType && (
                            <div
                              className={`attack-type ${
                                selectedItem.equipment.requiredLvl >
                                userData.level
                                  ? "red"
                                  : ""
                              } ${
                                selectedItem.equipment.attackType === "Melee"
                                  ? "melee"
                                  : selectedItem.equipment.attackType ===
                                    "Ranged"
                                  ? "ranged"
                                  : selectedItem.equipment.attackType ===
                                    "Magic"
                                  ? "magic"
                                  : ""
                              }`}
                            >
                              {selectedItem.equipment.attackType}
                            </div>
                          )}
                          <div
                            className={`required-lvl ${
                              selectedItem.equipment!.requiredLvl >
                              userData.level
                                ? "red"
                                : ""
                            }`}
                          >
                            Req. Lvl. {selectedItem.equipment!.requiredLvl}
                          </div>
                        </div>
                      )}{" "}
                      <div>
                        {selectedItem.item?.description ||
                          selectedItem.equipment?.description}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inv-buttons-div">
                  {selectedItem.equipment && selectedItem.equipmentId && (
                    <button
                      className={`equip-button ${
                        isEquipped() ? "equip-active" : ""
                      }`}
                      onClick={() =>
                        equip(selectedItem.id, selectedItem.equipment!.type)
                      }
                      disabled={
                        isEquipped() ||
                        !meetsLvlReq(selectedItem.equipment.requiredLvl)
                      }
                    >
                      {!meetsLvlReq(selectedItem.equipment.requiredLvl)
                        ? `Requires Lvl ${selectedItem.equipment.requiredLvl}`
                        : isEquipped()
                        ? "Equipped"
                        : "Equip"}
                    </button>
                  )}
                </div>
              </div>
            </div>{" "}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default InventoryPage;
