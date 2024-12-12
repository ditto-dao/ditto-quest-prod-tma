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

interface CombinedInventoryEntry {
  id: number;
  name: string;
  description: string;
  str: number;
  def: number;
  dex: number;
  magic: number;
  hp: number;
  rarity: string;
  type: string;
  category: "Equipment" | "Item";
  quantity: number | null; // null for equipment
  imgsrc: string;
}

// Helper function to chunk inventory into rows
function chunkInventory(array: CombinedInventoryEntry[], size: number) {
  const chunks: (CombinedInventoryEntry | null)[][] = [];
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
  const [combinedInventory, setCombinedInventory] = useState<
    CombinedInventoryEntry[]
  >([]);

  const [selectedItem, setSelectedItem] =
    useState<CombinedInventoryEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      // Map equipmentInventory to a unified format
      const equipmentList = userData.equipmentInventory.map((equipment) => ({
        id: equipment.id,
        name: equipment.equipment.name,
        description: equipment.equipment.description,
        str: equipment.equipment.str,
        def: equipment.equipment.def,
        dex: equipment.equipment.dex,
        magic: equipment.equipment.magic,
        hp: equipment.equipment.hp,
        rarity: equipment.equipment.rarity as string,
        type: equipment.equipment.type as string,
        category: "Equipment" as const,
        quantity: null,
        imgsrc: equipment.equipment.imgsrc,
      }));

      // Map itemInventory to a unified format
      const itemList = userData.itemInventory.map((item) => ({
        id: item.id,
        name: item.item.name,
        description: item.item.description,
        str: 0,
        def: 0,
        dex: 0,
        magic: 0,
        hp: 0,
        rarity: item.item.rarity as string,
        type: "Item",
        category: "Item" as const,
        quantity: item.quantity,
        imgsrc: item.item.imgsrc,
      }));

      // Combine and set the inventory
      setCombinedInventory([...equipmentList, ...itemList]);
    }
  }, [userData]);

  // Chunk inventory into rows of 4
  const inventoryRows = chunkInventory(combinedInventory, 4);

  // Modal
  const handleOpenModal = (item: CombinedInventoryEntry) => {
    setSelectedItem(item);
    setIsModalOpen(true);
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
          {combinedInventory.length === 0 ? (
            <div className="inventory-empty-message">
              Nothing in inventory yet...
            </div>
          ) : (
            <div className="inventory-rows-wrapper">
              {inventoryRows.map((row, rowIndex) => (
                <div key={rowIndex} className="inventory-row">
                  {row.map((entry) =>
                    entry ? (
                      <div
                        onClick={() => handleOpenModal(entry)} // Open modal on click
                        className="inventory-item"
                      >
                        <img
                          src={entry.imgsrc}
                          alt={entry.name}
                          className="inv-item-image"
                        />
                        {entry.category === "Item" &&
                          entry.quantity !== null && (
                            <div className="inv-item-quantity">
                              {formatNumberForInvQty(entry.quantity)}
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="inventory-item empty"></div>
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
