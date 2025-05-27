import { useState, useEffect } from "react";
import "./inventory-page.css";
import { useUserSocket } from "../../redux/socket/user/user-context";
import { formatNumberForInvQty } from "../../utils/helpers";
import { Inventory } from "../../utils/types";
import BalancesDisplay from "../balances/balances";
import { useNotification } from "../notifications/notification-context";
import ItemEqModal from "../item-eq-modal/item-eq-modal";
import { MAX_INITIAL_INVENTORY_SLOTS } from "../../utils/config";

// Helper function to chunk inventory into rows
function chunkInventoryWithPadding(
  array: Inventory[],
  maxSlots: number,
  rowSize: number
): (Inventory | null)[][] {
  const padded: (Inventory | null)[] = [...array];

  while (padded.length < maxSlots) {
    padded.push(null);
  }

  const chunks: (Inventory | null)[][] = [];
  for (let i = 0; i < padded.length; i += rowSize) {
    chunks.push(padded.slice(i, i + rowSize));
  }

  return chunks;
}

function InventoryPage() {
  const { addNotification, removeNotification } = useNotification();
  const { userData } = useUserSocket();
  const [inventory, setInventory] = useState<Inventory[]>([]);

  useEffect(() => {
    if (userData) {
      setInventory(userData.inventory);
    }
  }, [userData]);

  // Chunk inventory into rows of 4
  const inventoryRows = chunkInventoryWithPadding(
    inventory,
    userData?.maxInventorySlots ?? MAX_INITIAL_INVENTORY_SLOTS,
    4
  );

  // Modal
  const handleOpenModal = (item: Inventory) => {
    addNotification((id) => (
      <ItemEqModal
        selectedItem={item}
        notificationId={id}
        removeNotification={removeNotification}
      />
    ));
  };

  return (
    <div id="inventory-page-container">
      <BalancesDisplay />
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
    </div>
  );
}

export default InventoryPage;
