import { useState } from "react";
import Domains from "../../../assets/json/domains.json";
//import Dungeons from "../../../assets/json/dungeons.json";
import "./combat-menu.css";
import DomainMenuItem from "./domain/domain";
import { Domain } from "../../../utils/types";

function DomainComponent() {
  return (
    <div className="combat-tab-panel domain-list">
      {(Domains as Domain[]).map((domain) => (
        <DomainMenuItem
          key={domain.id}
          id={domain.id}
          name={domain.name}
          description={domain.description}
          imgsrc={domain.imgsrc}
          entryPriceGP={domain.entryPriceGP}
          entryPriceDittoWei={domain.entryPriceDittoWei}
          monsters={domain.monsters}
        />
      ))}
    </div>
  );
}

function DungeonComponent() {
  return (
    <div className="combat-tab-panel dungeon">Dungeon content here...</div>
  );
}

function CombatMenu() {
  type Categories = "Domain" | "Dungeon";
  const [selectedCategory, setSelectedCategory] =
    useState<Categories>("Domain");

  return (
    <div className="combat-menu-container">
      <div className="combat-menu-category-buttons-wrapper">
        <div className="combat-menu-category-buttons">
          <div
            className={`combat-menu-category-button ${
              selectedCategory === "Dungeon" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("Domain")}
          >
            Domain
          </div>
          <div
            className={`combat-menu-category-button ${
              selectedCategory === "Domain" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("Dungeon")}
          >
            Dungeon
          </div>
        </div>
      </div>

      {/* Conditional rendering here */}
      <div className="combat-tab-content-wrapper">
        {selectedCategory === "Domain" && <DomainComponent />}
        {selectedCategory === "Dungeon" && <DungeonComponent />}
      </div>
    </div>
  );
}

export default CombatMenu;
