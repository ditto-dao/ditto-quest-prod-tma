import "./exit-combat-first.css";
import PanicSlime from "../../../../assets/images/general/panic-slime.png";
import { FastImage } from "../../../fast-image/fast-image";

function ExitCombatMsg() {
  return (
    <div className="equip-slime-notification">
      <div className="equip-slime-notificaation-header">
        <FastImage src={PanicSlime} alt="Panic slime" />
        <div>Combat Ongoing</div>
      </div>
      <div className="equip-slime-message">
        Stop your combat activity first to continue.
      </div>
    </div>
  );
}

export default ExitCombatMsg;
