import "./sidebar.css";
import DQIcon from "../../assets/images/general/dq-logo.png";
import ShopIcon from "../../assets/images/sidebar/shop.png";
import AvatarIcon from "../../assets/images/sidebar/avatar.png";
import InventoryIcon from "../../assets/images/sidebar/bag.png";
import SkillsIcon from "../../assets/images/sidebar/skills.png";
import FarmingIcon from "../../assets/images/sidebar/farm.png";
import CraftingIcon from "../../assets/images/sidebar/craft.png";
import SlimeLabIcon from "../../assets/images/sidebar/slime-lab.png";
import CombatIcon from "../../assets/images/sidebar/combat.png";
import GachaIcon from "../../assets/images/sidebar/gacha.png";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  setPage: (page: string) => void;
}

function Sidebar({ isOpen, toggleSidebar, setPage }: SidebarProps) {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={toggleSidebar}>
        ✕
      </button>
      <div className="dq-icon-container">
        <img src={DQIcon} alt="Game Icon" className="dq-icon" />
      </div>
      <ul>
        <li>
          <a onClick={() => setPage("Avatar")}>
            <img src={AvatarIcon} alt="Avatar Icon" className="sidebar-icon" />
            Avatar
          </a>
        </li>
        <li>
          <a onClick={() => setPage("Inventory")}>
            <img
              src={InventoryIcon}
              alt="Inventory Icon"
              className="sidebar-icon"
            />
            Inventory
          </a>
        </li>
        <li>
          <a onClick={() => setPage("Skills")}>
            <img src={SkillsIcon} alt="Skills Icon" className="sidebar-icon" />
            Skills
          </a>
        </li>
        <li>
          <a onClick={() => setPage("Farming")}>
            <img
              src={FarmingIcon}
              alt="Farming Icon"
              className="sidebar-icon"
            />
            Farming
          </a>
        </li>
        <li>
          <a onClick={() => setPage("Crafting")}>
            <img
              src={CraftingIcon}
              alt="Crafting Icon"
              className="sidebar-icon"
            />
            Crafting
          </a>
        </li>
        <li>
          <a onClick={() => setPage("Slime Lab")}>
            <img
              src={SlimeLabIcon}
              alt="Slime Lab Icon"
              className="sidebar-icon"
            />
            Slime Lab
          </a>
        </li>
        <li>
          <a onClick={() => setPage("Combat")}>
            <img src={CombatIcon} alt="Combat Icon" className="sidebar-icon" />
            Combat
          </a>
        </li>
        <li>
          <a onClick={() => setPage("Gacha")}>
            <img src={GachaIcon} alt="Gacha Icon" className="sidebar-icon" />
            Gacha
          </a>
        </li>
        <li>
          <a onClick={() => setPage("Shop")}>
            <img src={ShopIcon} alt="Shop Icon" className="sidebar-icon" />
            Shop
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
