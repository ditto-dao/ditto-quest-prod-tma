import "./farming-page.css";
import farming from "../../assets/json/farming.json";
import { useIdleSkillSocket } from "../../redux/socket/idle/skill-context";
import FarmingItem from "./farming-item/farming-item";
import { useState } from "react";
import Stats from "../stats/stats";
import { useUserSocket } from "../../redux/socket/user/user-context";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

const categories = ["Lumber", "Ore", "Crystal"];

function FarmingPage() {
  const { userData } = useUserSocket();
  const { farmingStatuses } = useIdleSkillSocket();
  const [selectedCategory, setSelectedCategory] = useState<string>("Lumber"); // Default category

  // Filter and sort farming items based on selected category
  const filteredFarmingItems = farming
    .filter((item) => item.category === selectedCategory)
    .sort((a, b) => a.farmingLevelRequired - b.farmingLevelRequired);

  return (
    <div className="farming-page-container">
      <div className="stats-sticky">
        <Stats
          label="Farming"
          level={userData.farmingLevel}
          total={userData.expToNextFarmingLevel}
          progress={userData.farmingExp}
          secondaryColour="var(--sage-green)"
          bgColour="var(--pine-green)"
        />
        <SimpleBar className="category-buttons-scrollbar" autoHide={false}>
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
        </SimpleBar>
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
