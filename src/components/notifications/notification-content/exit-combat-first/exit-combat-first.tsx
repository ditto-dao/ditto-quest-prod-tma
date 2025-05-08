import "./exit-combat-first.css";
import PanicSlime from "../../../../assets/images/general/panic-slime.png";
import { useEffect } from "react";
import { preloadImage } from "../../../../utils/helpers";

function ExitCombatMsg() {
  useEffect(() => {
    const preloadAll = async () => {
      const staticImages = [PanicSlime];

      await Promise.all(staticImages.map(preloadImage));
    };

    preloadAll();
  }, []);

  return (
    <div className="equip-slime-notification">
      <div className="equip-slime-notificaation-header">
        <img src={PanicSlime} alt="Panic slime" />
        <div>Combat Ongoing</div>
      </div>
      <div className="equip-slime-message">
        Stop your combat activity first to continue.
      </div>
    </div>
  );
}

export default ExitCombatMsg;
