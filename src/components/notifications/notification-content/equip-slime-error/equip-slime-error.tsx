import "./equip-slime-error.css";
import PanicSlime from "../../../../assets/images/general/panic-slime.png";
import { useEffect } from "react";
import { preloadImage } from "../../../../utils/helpers";

function EquipSlimeNotification() {
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
        <div>No Slime Equipped</div>
      </div>
      <div className="equip-slime-message">
        Go to <span>Slime Lab</span> {">"} <span>Inventory</span> and equip a slime first. If you do not own a slime, pull one from the <span>Gacha</span>.
      </div>
    </div>
  );
}

export default EquipSlimeNotification;
