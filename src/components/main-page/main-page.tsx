import { useState } from "react";
import "./main-page.css";
import Sidebar from "../sidebar/sidebar";
import TestPage from "../test-page/test-page";
import InventoryPage from "../inventory-page/inventory-page";
import CraftingPage from "../crafting-page/crafting-page";
import SkillsPage from "../skills-page/skills-page";
import SlimeLabPage from "../slime-lab/slime-lab";
import FarmingPage from "../farming-page/farming-page";
import AvatarPage from "../avatar-page/avatar-page";
import Player from "./player/player";
import ShopIcon from "../../assets/images/sidebar/shop.png";
import AvatarIcon from "../../assets/images/sidebar/avatar.png";
import InventoryIcon from "../../assets/images/sidebar/bag.png";
import SkillsIcon from "../../assets/images/sidebar/skills.png";
import FarmingIcon from "../../assets/images/sidebar/farm.png";
import CraftingIcon from "../../assets/images/sidebar/craft.png";
import SlimeLabIcon from "../../assets/images/sidebar/slime-lab.png";
import CombatIcon from "../../assets/images/sidebar/combat.png";

function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("Avatar");

  // Mapping of pages to their respective icons
  const pageIcons: { [key: string]: string } = {
    Shop: ShopIcon,
    Avatar: AvatarIcon,
    Inventory: InventoryIcon,
    Skills: SkillsIcon,
    Farming: FarmingIcon,
    Crafting: CraftingIcon,
    "Slime Lab": SlimeLabIcon,
    Combat: CombatIcon,
    Test: ShopIcon, // Placeholder for Test
  };

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function setPage(page: string) {
    setCurrentPage(page);
    toggleSidebar(); // Close sidebar on page selection
  }

  function renderPage() {
    switch (currentPage) {
      case "Shop":
        return <div>Shop Page Content</div>;
      case "Avatar":
        return <AvatarPage />;
      case "Inventory":
        return <InventoryPage />;
      case "Skills":
        return <SkillsPage />;
      case "Farming":
        return <FarmingPage />;
      case "Crafting":
        return <CraftingPage />;
      case "Slime Lab":
        return <SlimeLabPage />;
      case "Combat":
        return <div>Combat Page Content</div>;
      case "Test":
        return <TestPage />;
      default:
        return <div>Avatar Page Content</div>;
    }
  }

  return (
    <div id="main-page-container" className="noselect">
      <header className="header">
        <div className="open-sidebar-btn" onClick={toggleSidebar}>
          ☰
        </div>
        <div className="header-title">
          {/* Render the icon and page name dynamically */}
          {pageIcons[currentPage] && (
            <img
              src={pageIcons[currentPage]}
              alt={`${currentPage} Icon`}
              className="header-icon"
            />
          )}
        </div>
        <Player />
      </header>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setPage={setPage}
      />
      <div className="content">{renderPage()}</div>
    </div>
  );
}

export default MainPage;
