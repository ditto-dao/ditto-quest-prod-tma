import "./level-up-notification.css";
import Fireworks from "../../../../assets/images/general/celebration.png";
import { useEffect, useState } from "react";
import { preloadImage } from "../../../../utils/helpers";

interface LevelUpNotificationProps {
  lvlLabel: string;
  newLevel: number;
}

function LevelUpNotification(props: LevelUpNotificationProps) {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    const preloadAll = async () => {
      const staticImages = [Fireworks];

      await Promise.all(staticImages.map(preloadImage));
      setImagesPreloaded(true);
    };

    preloadAll();
  }, []);

  if (!imagesPreloaded) return null;

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
