import { useState } from "react";
import "./main-page.css";
import Sidebar from "../sidebar/sidebar";
import InventoryPage from "../inventory-page/inventory-page";
import CraftingPage from "../crafting-page/crafting-page";
import SkillsPage from "../skills-page/skills-page";
import SlimeLabPage from "../slime-lab/slime-lab";
import FarmingPage from "../farming-page/farming-page";
import AvatarPage from "../avatar-page/avatar-page";
import GachaPage from "../gacha-page/gacha-page";
import CombatPage from "../combat-page/combat-page";
import NotificationManager from "../notifications/notification-manager";
import Stats from "../stats/stats";
import { useLoginSocket } from "../../redux/socket/login/login-context";
import { useUserSocket } from "../../redux/socket/user/user-context";
import { useIdleSkillSocket } from "../../redux/socket/idle/skill-context";
import ShopIcon from "../../assets/images/sidebar/shop.png";
import AvatarIcon from "../../assets/images/sidebar/avatar.png";
import InventoryIcon from "../../assets/images/sidebar/bag.png";
import SkillsIcon from "../../assets/images/sidebar/skills.png";
import FarmingIcon from "../../assets/images/sidebar/farm.png";
import CraftingIcon from "../../assets/images/sidebar/craft.png";
import SlimeLabIcon from "../../assets/images/sidebar/slime-lab.png";
import CombatIcon from "../../assets/images/sidebar/combat.png";
import GachaIcon from "../../assets/images/sidebar/gacha.png";
import LoadingPage from "../loading-page/loading-page";
import AccessDeniedPage from "../access-denied-page/access-denied-page";

function MainPage() {
  const { accessGranted, accessDeniedMessage, socketDataLoadComplete } =
    useLoginSocket();
  const { userContextLoaded, userData } = useUserSocket();
  const { offlineProgressUpdatesReceived } = useIdleSkillSocket();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("Avatar");
  const [view, setView] = useState("loading"); // 'loading', 'access-denied', 'main'

  const pageIcons: { [key: string]: string } = {
    Shop: ShopIcon,
    Avatar: AvatarIcon,
    Inventory: InventoryIcon,
    Skills: SkillsIcon,
    Farming: FarmingIcon,
    Crafting: CraftingIcon,
    "Slime Lab": SlimeLabIcon,
    Combat: CombatIcon,
    Gacha: GachaIcon,
  };

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function setPage(page: string) {
    setCurrentPage(page);
    toggleSidebar();
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
        return <CombatPage />;
      case "Gacha":
        return <GachaPage />;
      default:
        return <AvatarPage />;
    }
  }

  return (
    <div id="main-page-container" className="noselect">
      <div className={`fade-view ${view === "loading" ? "active" : ""}`}>
        <LoadingPage
          accessGranted={accessGranted}
          socketDataLoadComplete={socketDataLoadComplete}
          userContextLoaded={userContextLoaded}
          offlineProgressUpdatesReceived={offlineProgressUpdatesReceived}
          onFinishLoading={(page: string) => {
            setView(page);
          }}
          accessDeniedMessage={accessDeniedMessage}
        />
      </div>

      <div className={`fade-view ${view === "access-denied" ? "active" : ""}`}>
        <AccessDeniedPage msg={accessDeniedMessage} />
      </div>

      <div className={`fade-view ${view === "main" ? "active" : ""}`}>
        <header className="header">
          <div className="open-sidebar-btn" onClick={toggleSidebar}>
            ☰
          </div>
          <div className="header-title">
            {pageIcons[currentPage] && (
              <img
                src={pageIcons[currentPage]}
                alt={`${currentPage} Icon`}
                className="header-icon"
              />
            )}
          </div>
          {currentPage === "Farming" && (
            <Stats
              level={userData.farmingLevel}
              total={userData.expToNextFarmingLevel}
              progress={userData.farmingExp}
            />
          )}
          {currentPage === "Crafting" && (
            <Stats
              level={userData.craftingLevel}
              total={userData.expToNextCraftingLevel}
              progress={userData.craftingExp}
            />
          )}
        </header>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          setPage={setPage}
        />
        <div className="content">{renderPage()}</div>
        {view === "main" && <NotificationManager />}{" "}
      </div>
    </div>
  );
}

export default MainPage;
