import "./crafting-page.css";
import craftingRecipes from "../../assets/json/crafting-recipes.json";
import CraftingRecipe from "./crafting-recipe/crafting-recipe";
import DefaultHat from "../../assets/images/avatar-page/default-hat.png";
import DefaultCape from "../../assets/images/avatar-page/default-cape.png";
import DefaultWeapon from "../../assets/images/avatar-page/default-sword.png";
import DefaultShield from "../../assets/images/avatar-page/default-shield.png";
//import DefaultNecklace from "../../assets/images/avatar-page/default-necklace.png";
import DefaultArmour from "../../assets/images/avatar-page/default-armour.png";
import { useIdleSkillSocket } from "../../redux/socket/idle/skill-context";
import { useState } from "react";
import { EquipmentType } from "../../utils/types";

const categoryImages: { [key: string]: string } = {
  Weapon: DefaultWeapon,
  Shield: DefaultShield,
  Hat: DefaultHat,
  Armour: DefaultArmour,
  Cape: DefaultCape,
  //Necklace: DefaultNecklace,
};

const categories = Object.keys(categoryImages); // Use keys from the mapping

function CraftingPage() {
  const { craftingStatuses } = useIdleSkillSocket();
  const [selectedCategory, setSelectedCategory] = useState<string>("Weapon");

  const filteredRecipes = craftingRecipes
    .filter((recipe) => recipe.type === selectedCategory.toLowerCase())
    .sort((a, b) => a.craftingLevelRequired - b.craftingLevelRequired);

  return (
    <div className="crafting-page-container">
      <div className="equipment-category-buttons-wrapper">
        <div className="equipment-category-buttons">
          {categories.map((category) => (
            <div
              key={category}
              className={`equipment-category-button ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <img
                src={categoryImages[category]}
                alt={category}
                className="category-icon"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="crafting-recipes-container">
        {filteredRecipes.map((recipe) => (
          <CraftingRecipe
            key={recipe.equipmentId}
            equipmentId={recipe.equipmentId}
            equipmentName={recipe.equipmentName}
            type={recipe.type as EquipmentType}
            craftingLevelRequired={recipe.craftingLevelRequired}
            craftingExp={recipe.craftingExp}
            durationS={recipe.durationS}
            requiredItems={recipe.requiredItems}
            craftingStatus={craftingStatuses[recipe.equipmentId] || null}
            imgsrc={recipe.imgsrc}
          />
        ))}
      </div>
    </div>
  );
}

export default CraftingPage;
