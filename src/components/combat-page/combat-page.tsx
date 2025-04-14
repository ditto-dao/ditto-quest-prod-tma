import { useCombatSocket } from "../../redux/socket/idle/combat-context";
import "./combat-page.css";
import CombatConsole from "./combat-console/combat-console";
import CombatMenu from "./combat-menu/combat-menu";
import { AnimatePresence, motion } from "framer-motion";

function CombatPage() {
  const { isBattling } = useCombatSocket();

  return (
    <div className="combat-page-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={isBattling ? "console" : "menu"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {isBattling ? <CombatConsole /> : <CombatMenu />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default CombatPage;
