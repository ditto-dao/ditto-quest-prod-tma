import "./farming-page.css";
import farming from "../../assets/json/farming.json";
import { useIdleSkillSocket } from "../../redux/socket/idle/skill-context";
import FarmingItem from "./farming-item/farming-item";
import { useState } from "react";

const categories = ["Ore", "Crystal", "Essence", "Fiber", "Shards"];

function FarmingPage() {
  const { farmingStatuses } = useIdleSkillSocket();
  const [selectedCategory, setSelectedCategory] = useState<string>("Ore"); // Default category

  // Filter and sort farming items based on selected category
  const filteredFarmingItems = farming
    .filter((item) => item.category === selectedCategory)
    .sort((a, b) => a.farmingLevelRequired - b.farmingLevelRequired);

  return (
    <div className="farming-page-container">
      {/* Scrollable Category Buttons (Fixed at the Top) */}
      <div className="category-buttons-wrapper">
        <div className="category-buttons">
          {categories.map((category) => (
            <div
              key={category}
              className={`category-button ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Farming Items Section */}
      <div className="farming-items-container">
        <div className="farming-items-grid">
          {filteredFarmingItems.length === 0 ? (
            <div className="no-items">No items available</div>
          ) : (
            filteredFarmingItems.map((item, index) => (
              <div
                key={item.id}
                className={`farming-item-wrapper ${
                  filteredFarmingItems.length % 2 === 1 &&
                  index === filteredFarmingItems.length - 1
                    ? "single-item" // Apply single-item class if last item
                    : ""
                }`}
              >
                <FarmingItem
                  id={item.id}
                  name={item.name}
                  rarity={item.rarity}
                  description={item.description}
                  farmingLevelRequired={item.farmingLevelRequired}
                  farmingDurationS={item.farmingDurationS}
                  farmingExp={item.farmingExp}
                  farmingStatus={farmingStatuses[item.id] || null}
                  imgsrc={item.imgsrc}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmingPage;