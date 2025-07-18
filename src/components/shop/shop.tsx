import "./shop.css";
import ShopItems from "../../assets/json/shop.json";
import { useState } from "react";
import ShopItem from "./shop-item/shop-item";
import { ShopItemData, ShopItemType } from "../../utils/types";
import BalancesDisplay from "../balances/balances";
import FastImage from "../fast-image/fast-image";
import PotionIcon from "../../assets/images/general/potions-shop.png";
import NecklaceIcon from "../../assets/images/general/necklace-shop.png";

function Shop() {
  const [selectedCategory, setSelectedCategory] =
    useState<ShopItemType>("EQUIPMENT");

  const filteredItems = (ShopItems as any as ShopItemData[]).filter(
    (item) => item.type === selectedCategory && item.isActive
  );

  return (
    <div className="shop-page-container">
      <div className="shop-stats-sticky">
        <div className="shop-balances-container">
          <BalancesDisplay />
        </div>
        <div className="shop-category-buttons">
          <div
            key={"EQUIPMENT"}
            className={`shop-category-button ${
              selectedCategory === "EQUIPMENT" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("EQUIPMENT")}
          >
            <FastImage
              src={NecklaceIcon}
              alt="Necklace"
              className="category-icon"
            />
          </div>
          <div
            key={"SERVICE"}
            className={`shop-category-button ${
              selectedCategory === "SERVICE" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("SERVICE")}
          >
            <FastImage
              src={PotionIcon}
              alt="Potion"
              className="category-icon"
            />
          </div>
        </div>
      </div>

      <div className="shop-items-container">
        {filteredItems.map((item) => (
          <ShopItem
            key={item.id}
            item={item}
            allowMultiple={
              item.serviceType !== "SLIME_INVENTORY_SLOT" &&
              item.serviceType !== "INVENTORY_SLOT"
            }
          />
        ))}
      </div>
    </div>
  );
}

export default Shop;
