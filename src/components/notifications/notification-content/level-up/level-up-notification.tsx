import "./level-up-notification.css";
import Fireworks from "../../../../assets/images/general/celebration.png";
import { useEffect } from "react";
import { preloadImage } from "../../../../utils/helpers";

interface LevelUpNotificationProps {
  lvlLabel: string;
  newLevel: number;
}

function LevelUpNotification(props: LevelUpNotificationProps) {
  useEffect(() => {
    const preloadAll = async () => {
      const staticImages = [Fireworks];

      await Promise.all(staticImages.map(preloadImage));
    };

    preloadAll();
  }, []);

  return (
    <div className="level-up-notification">
      <div className="level-up-notificaation-header">
        <img src={Fireworks} alt="Fireworks" />
        <div>Level Up</div>
      </div>
      <div className="level-up-message">
        Congratulations! You have reached {props.lvlLabel}{" "}
        <span>{props.newLevel}</span>.
      </div>
    </div>
  );
}

export default LevelUpNotification;
