import { useCombatSocket } from "../../redux/socket/idle/combat-context";
import "./combat-page.css";
import CombatConsole from "./combat-console/combat-console";
import CombatMenu from "./combat-menu/combat-menu";

function CombatPage() {
  const { isBattling } = useCombatSocket();

  return (
    <div className="combat-page-container">
      {isBattling ? <CombatConsole /> : <CombatMenu />}
    </div>
  );
}

export default CombatPage;
