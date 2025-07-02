import { useState, useEffect } from "react";
import "./inventory-page.css";
import { useUserSocket } from "../../redux/socket/user/user-context";
import { formatNumberForInvQty } from "../../utils/helpers";
import { preloadImagesBatch } from "../../utils/image-cache";
import FastImage from "../fast-image/fast-image";
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
  const [inventoryImagesLoaded, setInventoryImagesLoaded] = useState(false);

  // Preload inventory images when inventory changes
  useEffect(() => {
    const preloadInventoryImages = async () => {
      if (!userData?.inventory) {
        setInventoryImagesLoaded(true);
        return;
      }

      const inventoryImages = userData.inventory
        .map((entry) => entry.equipment?.imgsrc || entry.item?.imgsrc)
        .filter(Boolean) as string[];

      if (inventoryImages.length > 0) {
        try {
          await preloadImagesBatch(inventoryImages);
          setInventoryImagesLoaded(true);
        } catch (error) {
          console.error("Failed to preload some inventory images:", error);
          setInventoryImagesLoaded(true); // Still proceed even if some images fail
        }
      } else {
        setInventoryImagesLoaded(true); // No images to load
      }
    };

    preloadInventoryImages();
  }, [userData?.inventory]);

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
                      {inventoryImagesLoaded ? (
                        <FastImage
                          src={
                            entry.equipment?.imgsrc || entry.item?.imgsrc || ""
                          }
                          alt={
                            entry.equipment?.name || entry.item?.name || "Item"
                          }
                          className="inv-item-image"
                        />
                      ) : (
                        <div className="inventory-image-placeholder shimmer" />
                      )}
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
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;
