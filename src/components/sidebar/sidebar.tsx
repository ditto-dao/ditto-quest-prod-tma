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
import ReferralIcon from "../../assets/images/sidebar/referral.png";
import GetMoreDittoIcon from "../../assets/images/sidebar/get-more-ditto.png";
import { useNotification } from "../notifications/notification-context";
import OpenDGNotification from "../notifications/notification-content/open-dg-notification/open-dg-notification";
import SimpleBar from "simplebar-react";
import TgIcon from "../../assets/images/sidebar/tg-icon.png";
import BotIcon from "../../assets/images/sidebar/bot-icon.png";
import WalletIcon from "../../assets/images/sidebar/wallet-icon.png";
import { useEffect, useState } from "react";
import { preloadImagesBatch } from "../../utils/image-cache";
import FastImage from "../../components/fast-image/fast-image";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  setPage: (page: string) => void;
}

function Sidebar({ isOpen, toggleSidebar, setPage }: SidebarProps) {
  const { addNotification } = useNotification();

  const [_, setImagesLoaded] = useState(false);

  useEffect(() => {
    const preloadSidebarImages = async () => {
      const sidebarIcons = [
        DQIcon,
        ShopIcon,
        AvatarIcon,
        InventoryIcon,
        SkillsIcon,
        FarmingIcon,
        CraftingIcon,
        SlimeLabIcon,
        CombatIcon,
        GachaIcon,
        ReferralIcon,
        GetMoreDittoIcon,
        TgIcon,
        BotIcon,
        WalletIcon,
      ];

      try {
        await preloadImagesBatch(sidebarIcons);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Failed to preload some sidebar images:", error);
        setImagesLoaded(true); // Still proceed even if some images fail
      }
    };

    preloadSidebarImages();
  }, []);

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={toggleSidebar}>
        ✕
      </button>
      <div className="dq-icon-container">
        <FastImage src={DQIcon} alt="Game Icon" className="dq-icon" />
        <div className="dq-icon-buttons">
          <a onClick={() => setPage("Token")}>
            <FastImage
              src={WalletIcon}
              alt="Wallet Icon"
              className="dq-icon-button"
            />
          </a>
          <a
            href="https://t.me/teamditto"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FastImage
              src={TgIcon}
              alt="Telegram Icon"
              className="dq-icon-button"
            />
          </a>
          <a
            href="https://t.me/the_ditto_bot"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FastImage
              src={BotIcon}
              alt="Bot Icon"
              className="dq-icon-button"
            />
          </a>
        </div>
      </div>
      <SimpleBar
        className="sidebar-scrollbar"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        <ul>
          <li>
            <a onClick={() => setPage("Avatar")}>
              <FastImage
                src={AvatarIcon}
                alt="Avatar Icon"
                className="sidebar-icon"
              />
              Avatar
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Inventory")}>
              <FastImage
                src={InventoryIcon}
                alt="Inventory Icon"
                className="sidebar-icon"
              />
              Inventory
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Skills")}>
              <FastImage
                src={SkillsIcon}
                alt="Skills Icon"
                className="sidebar-icon"
              />
              Stats
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Farming")}>
              <FastImage
                src={FarmingIcon}
                alt="Farming Icon"
                className="sidebar-icon"
              />
              Farming
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Crafting")}>
              <FastImage
                src={CraftingIcon}
                alt="Crafting Icon"
                className="sidebar-icon"
              />
              Crafting
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Slime Lab")}>
              <FastImage
                src={SlimeLabIcon}
                alt="Slime Lab Icon"
                className="sidebar-icon"
              />
              Slime Lab
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Combat")}>
              <FastImage
                src={CombatIcon}
                alt="Combat Icon"
                className="sidebar-icon"
              />
              Combat
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Gacha")}>
              <FastImage
                src={GachaIcon}
                alt="Gacha Icon"
                className="sidebar-icon"
              />
              Gacha
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Shop")}>
              <FastImage
                src={ShopIcon}
                alt="Shop Icon"
                className="sidebar-icon"
              />
              Shop
            </a>
          </li>
          <li>
            <a onClick={() => setPage("Referral")}>
              <FastImage
                src={ReferralIcon}
                alt="Referral Icon"
                className="sidebar-icon"
              />
              Referral
            </a>
          </li>
          <li>
            <a
              onClick={() => {
                addNotification(() => <OpenDGNotification />);
              }}
            >
              <FastImage
                src={GetMoreDittoIcon}
                alt="Get More Ditto Icon"
                className="sidebar-icon"
              />
              Get More DITTO
            </a>
          </li>
        </ul>
      </SimpleBar>
    </div>
  );
}

export default Sidebar;
