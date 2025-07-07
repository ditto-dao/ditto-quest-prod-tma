import { useUserSocket } from "../../redux/socket/user/user-context";
import "./item-eq-modal.css";
import EquipmentIcon from "../../assets/images/general/equipment-icon.png";
import ItemIcon from "../../assets/images/general/item-icon.png";
import { EquipmentType, Inventory } from "../../utils/types";
import { useNotification } from "../notifications/notification-context";
import SellNotification from "../sell-modal/sell-modal";
import { useState, useEffect } from "react";
import { preloadImageCached } from "../../utils/image-cache";
import FastImage from "../fast-image/fast-image";
import { aggregateStatEffects } from "../../utils/helpers";
import CombatStats from "../combat-stats/combat-stats";

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
  const [itemImageLoaded, setItemImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "stats">("info");

  // Preload the item/equipment image
  useEffect(() => {
    const preloadItemImage = async () => {
      const imageSrc =
        selectedItem.item?.imgsrc || selectedItem.equipment?.imgsrc;

      if (imageSrc) {
        try {
          await preloadImageCached(imageSrc);
          setItemImageLoaded(true);
        } catch (error) {
          console.error("Failed to preload item image:", error);
          setItemImageLoaded(true); // Still proceed even if image fails
        }
      } else {
        setItemImageLoaded(true); // No image to load
      }
    };

    preloadItemImage();
  }, [selectedItem]);

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

  // Calculate aggregated stats for equipment
  const itemAggregatedStats = selectedItem.equipment
    ? aggregateStatEffects([selectedItem.equipment.statEffect])
    : null;

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
          {itemImageLoaded ? (
            <FastImage
              src={
                selectedItem.item?.imgsrc ||
                selectedItem.equipment?.imgsrc ||
                ""
              }
              alt={
                selectedItem.item?.name ||
                selectedItem.equipment?.name ||
                "Item"
              }
              className="item-image"
            />
          ) : (
            <div className="item-image-placeholder shimmer" />
          )}
        </div>
      </div>

      {/* Only show tabs for equipment */}
      {selectedItem.equipment && (
        <div className="item-tabs">
          <button
            className={`item-tab ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Info
          </button>
          <button
            className={`item-tab ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
        </div>
      )}
      
      <div className="tab-content-container">
        {selectedItem.equipment &&
        activeTab === "stats" &&
        itemAggregatedStats ? (
          <CombatStats stats={itemAggregatedStats} colorScheme="item" />
        ) : (
          <div className="item-details">
            <div className="item-content">
              <div className="inv-modal-item-description-container">
                <div className="item-header">
                  {selectedItem.itemId ? (
                    <FastImage
                      src={ItemIcon}
                      alt="Item icon"
                      className="item-icon"
                    />
                  ) : (
                    <FastImage
                      src={EquipmentIcon}
                      alt="Equipment icon"
                      className="equipment-icon"
                    />
                  )}
                  <div className="inv-modal-header-name">
                    {selectedItem.item?.name || selectedItem.equipment?.name}
                  </div>
                </div>

                {selectedItem.equipment && (
                  <div className="inv-eq-tab-info">
                    {selectedItem.equipment.attackType && (
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
                        selectedItem.equipment.requiredLvlCombat >
                        userData.level
                          ? "red"
                          : ""
                      }`}
                    >
                      Req. Lvl. {selectedItem.equipment.requiredLvlCombat}
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
        )}
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
