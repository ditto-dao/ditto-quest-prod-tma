import { useState, useEffect } from "react";
import "./inventory-page.css";
import { useUserSocket } from "../../redux/socket/user/user-context";
import DittoCoinLogo from "../../assets/images/general/ditto-coin.png";
import GoldCoinLogo from "../../assets/images/general/gold-coin.png";
import {
  formatNumberForInvQty,
  formatNumberWithSuffix,
} from "../../utils/helpers";
import InventoryModal from "./inventory-modal/inventory-modal";
import { Inventory } from "../../utils/types";

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
  const { userData } = useUserSocket();
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

  return (
    <div id="inventory-page-container">
      <div className="inventory-page-content-wrapper">
        <div className="inventory-page-content-container">
          <div className="inv-container-label">Bank</div>
          <div className="balances-container">
            <div className="coin-balance">
              <img src={DittoCoinLogo} alt="Ditto Coin" className="coin-logo" />
              <span>{formatNumberWithSuffix(100000000000)} DITTO</span>
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
            <div className="inventory-empty-message">
              Nothing in inventory yet...
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

        {/* Render the modal */}
        <InventoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          item={selectedItem}
        />
      </div>
    </div>
  );
}

export default InventoryPage;
