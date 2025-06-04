import { useState, useEffect } from "react";
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
import LoadingPage from "../loading-page/loading-page";
import AccessDeniedPage from "../access-denied-page/access-denied-page";
import CurrentActivityDisplay from "../current-activity-display/current-activity-display";
import ReferralPage from "../referral-page/referral-page";
import { AnimatePresence, motion } from "framer-motion";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import { useLoginSocket } from "../../redux/socket/login/login-context";

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
import { FloatingUpdateDisplay } from "../floating-update-display/floating-update-display";
import { useFloatingUpdate } from "../../redux/socket/idle/floating-update-context";

const pageIcons: Record<string, string> = {
  Shop: ShopIcon,
  Avatar: AvatarIcon,
  Inventory: InventoryIcon,
  Skills: SkillsIcon,
  Farming: FarmingIcon,
  Crafting: CraftingIcon,
  "Slime Lab": SlimeLabIcon,
  Combat: CombatIcon,
  Gacha: GachaIcon,
  Referral: ReferralIcon,
};

function MainPage() {
  const {
    accessGranted,
    accessDeniedMessage,
    loginProgress,
    loginComplete,
  } = useLoginSocket();
  const { updates } = useFloatingUpdate();

  const [view, setView] = useState<"loading" | "main" | "access-denied">("loading");
  const [currentPage, setCurrentPage] = useState("Avatar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (loginComplete && accessGranted) {
      setTimeout(() => setView("main"), 400); // slight delay for smooth UX
    } else if (loginComplete && !accessGranted && accessDeniedMessage.trim()) {
      setView("access-denied");
    }
  }, [loginComplete, accessGranted, accessDeniedMessage]);

  const renderPage = () => {
    switch (currentPage) {
      case "Shop": return <div>Shop Page Content</div>;
      case "Avatar": return <AvatarPage />;
      case "Inventory": return <InventoryPage />;
      case "Skills": return <SkillsPage />;
      case "Farming": return <FarmingPage />;
      case "Crafting": return <CraftingPage />;
      case "Slime Lab": return <SlimeLabPage />;
      case "Combat": return <CombatPage />;
      case "Gacha": return <GachaPage />;
      case "Referral": return <ReferralPage />;
      default: return <AvatarPage />;
    }
  };

  return (
    <div id="main-page-container" className="noselect">
      <AnimatePresence mode="wait">
        {view === "loading" && (
          <motion.div
            key="loading"
            className="main-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingPage progress={loginProgress} />
          </motion.div>
        )}

        {view === "access-denied" && (
          <motion.div
            key="access-denied"
            className="main-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AccessDeniedPage msg={accessDeniedMessage} />
          </motion.div>
        )}

        {view === "main" && (
          <motion.div
            key="main"
            className="main-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <header className="header">
              <div className="open-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
              <CurrentActivityDisplay />
            </header>

            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              setPage={(page) => {
                setCurrentPage(page);
                setIsSidebarOpen(false);
              }}
            />

            <SimpleBar className="content">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="page-motion-wrapper"
              >
                {renderPage()}
              </motion.div>
            </SimpleBar>
            <NotificationManager />
            <FloatingUpdateDisplay updates={updates}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainPage;