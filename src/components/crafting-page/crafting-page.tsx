import "./crafting-page.css";
import craftingRecipes from "../../assets/json/crafting-recipes.json"
import CraftingRecipe from "./crafting-recipe/crafting-recipe";
import { useIdleSocket } from "../../redux/socket/idle/idle-context";

function CraftingPage() {
  const { craftingStatuses } = useIdleSocket();

  return (
    <div className="crafting-page-container">
      {craftingRecipes.map((recipe) => (
        <CraftingRecipe
          key={recipe.equipmentId}
          equipmentId={recipe.equipmentId}
          equipmentName={recipe.equipmentName}
          craftingLevelRequired={recipe.craftingLevelRequired}
          craftingExp={recipe.craftingExp}
          durationS={recipe.durationS}
          requiredItems={recipe.requiredItems}
          craftingStatus={craftingStatuses[recipe.equipmentId] || null}
          imgsrc={recipe.imgsrc}
        />
      ))}
    </div>
  );
}

export default CraftingPage;
